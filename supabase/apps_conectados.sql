-- Apps conectados: chaves de acesso, jogadores, servidor e tempo ativo.
-- Rode uma vez no Supabase (SQL Editor) se ainda não estiver aplicado.

-- Chaves de acesso por app/jogo (guardamos só o hash SHA-256)
create table if not exists public.painel_chaves (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users on delete cascade,
  projeto_id uuid not null references public.painel_projetos(id) on delete cascade,
  nome text not null default 'Chave principal' check (char_length(nome) <= 60),
  prefixo text not null check (char_length(prefixo) <= 16),
  hash text not null unique check (hash ~ '^[0-9a-f]{64}$'),
  ativa boolean not null default true,
  ultimo_uso timestamptz,
  usos bigint not null default 0,
  criado_em timestamptz not null default now()
);
create index if not exists painel_chaves_projeto_id_idx on public.painel_chaves (projeto_id);
create index if not exists painel_chaves_owner_idx on public.painel_chaves (owner);
alter table public.painel_chaves enable row level security;
drop policy if exists "dono gerencia" on public.painel_chaves;
create policy "dono gerencia" on public.painel_chaves for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()) and exists (select 1 from public.painel_projetos p where p.id = projeto_id and p.owner = (select auth.uid())));

-- Jogadores / usuários de cada app (1 linha por usuário)
create table if not exists public.painel_jogadores (
  projeto_id uuid not null references public.painel_projetos(id) on delete cascade,
  usuario text not null,
  nome text not null default '',
  plataforma text not null default '',
  metodo text not null default '',
  plano text not null default '',
  plano_valor numeric not null default 0,
  plano_status text not null default '',
  plano_expira timestamptz,
  gasto numeric not null default 0,
  partidas int not null default 0,
  primeiro_em timestamptz not null default now(),
  visto_em timestamptz not null default now(),
  online_ate timestamptz,
  primary key (projeto_id, usuario)
);
create index if not exists painel_jogadores_visto_idx on public.painel_jogadores (projeto_id, visto_em desc);
alter table public.painel_jogadores enable row level security;

-- Estado do servidor e tempo ativo por dia
create table if not exists public.painel_servidor (
  projeto_id uuid primary key references public.painel_projetos(id) on delete cascade,
  online int not null default 0,
  ativo boolean not null default false,
  ativo_desde timestamptz,
  ultimo_sinal timestamptz,
  versao text not null default '',
  dados jsonb not null default '{}'
);
alter table public.painel_servidor enable row level security;
create table if not exists public.painel_uptime (
  projeto_id uuid not null references public.painel_projetos(id) on delete cascade,
  dia date not null,
  segundos int not null default 0,
  pico_online int not null default 0,
  primary key (projeto_id, dia)
);
alter table public.painel_uptime enable row level security;

do $$ declare t text; begin
  foreach t in array array['painel_jogadores','painel_servidor','painel_uptime'] loop
    execute format('drop policy if exists "dono le" on public.%I', t);
    execute format('drop policy if exists "dono apaga" on public.%I', t);
    execute format('create policy "dono le" on public.%I for select to authenticated using (exists (select 1 from public.painel_projetos p where p.id = projeto_id and p.owner = (select auth.uid())))', t);
    execute format('create policy "dono apaga" on public.%I for delete to authenticated using (exists (select 1 from public.painel_projetos p where p.id = projeto_id and p.owner = (select auth.uid())))', t);
  end loop;
end $$;

-- Conversão segura de texto
create or replace function painel_priv.num(x text) returns numeric language plpgsql immutable set search_path = '' as $$
begin return x::numeric; exception when others then return null; end $$;
create or replace function painel_priv.ts(x text) returns timestamptz language plpgsql stable set search_path = '' as $$
begin return x::timestamptz; exception when others then return null; end $$;

-- Porta de entrada dos apps: valida a chave e grava os eventos
create or replace function public.painel_enviar(chave text, eventos jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  k record; s record; ev jsonb; d jsonb;
  t text; u text; nm text; pl text; quando timestamptz; agora timestamptz := now();
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  n int := 0; gap numeric; onl int; v numeric; pln text; st text; exp timestamptz; recente boolean;
begin
  if chave is null or char_length(chave) not between 20 and 200 then raise exception 'chave inválida' using errcode = '28000'; end if;
  select c.id, c.projeto_id into k from public.painel_chaves c
   where c.hash = encode(extensions.digest(chave, 'sha256'), 'hex') and c.ativa;
  if not found then raise exception 'chave inválida' using errcode = '28000'; end if;
  if jsonb_typeof(eventos) = 'object' then eventos := jsonb_build_array(eventos); end if;
  if eventos is null or jsonb_typeof(eventos) <> 'array' then raise exception 'eventos deve ser uma lista' using errcode = '22023'; end if;
  if jsonb_array_length(eventos) > 200 then raise exception 'máximo de 200 eventos por envio' using errcode = '22023'; end if;
  update public.painel_chaves set ultimo_uso = agora, usos = usos + 1 where id = k.id;

  for ev in select value from jsonb_array_elements(eventos) loop
    if jsonb_typeof(ev) <> 'object' then continue; end if;
    t := lower(coalesce(ev->>'tipo', ''));
    if t !~ '^[a-z_]{2,30}$' then continue; end if;
    u := left(coalesce(ev->>'usuario', ''), 100);
    nm := left(coalesce(ev->>'nome', ''), 60);
    pl := left(coalesce(ev->>'plataforma', ''), 30);
    d := case when jsonb_typeof(ev->'dados') = 'object' then ev->'dados' else '{}'::jsonb end;
    if pg_column_size(d) > 4000 then d := '{}'::jsonb; end if;
    quando := coalesce(painel_priv.ts(ev->>'em'), agora);
    quando := least(greatest(quando, agora - interval '7 days'), agora);
    recente := quando > agora - interval '5 minutes';

    -- Servidor: sinal de vida (mande a cada 1 minuto)
    if t = 'servidor' then
      onl := greatest(0, least(coalesce(painel_priv.num(d->>'online'), 0), 10000000))::int;
      select * into s from public.painel_servidor where projeto_id = k.projeto_id for update;
      if not found then
        insert into public.painel_servidor (projeto_id) values (k.projeto_id) returning * into s;
      end if;
      gap := extract(epoch from agora - s.ultimo_sinal);
      if s.ativo and s.ultimo_sinal is not null and gap <= 180 then
        insert into public.painel_uptime as x (projeto_id, dia, segundos, pico_online) values (k.projeto_id, hoje, gap::int, onl)
          on conflict (projeto_id, dia) do update set segundos = least(86400, x.segundos + excluded.segundos), pico_online = greatest(x.pico_online, excluded.pico_online);
        update public.painel_servidor set online = onl, ultimo_sinal = agora, versao = coalesce(left(d->>'versao', 30), versao), dados = d where projeto_id = k.projeto_id;
      else
        insert into public.painel_uptime as x (projeto_id, dia, segundos, pico_online) values (k.projeto_id, hoje, 0, onl)
          on conflict (projeto_id, dia) do update set pico_online = greatest(x.pico_online, excluded.pico_online);
        update public.painel_servidor set online = onl, ativo = true, ativo_desde = agora, ultimo_sinal = agora, versao = coalesce(left(d->>'versao', 30), versao), dados = d where projeto_id = k.projeto_id;
      end if;
      n := n + 1; continue;
    end if;
    if t = 'servidor_parou' then
      update public.painel_servidor set ativo = false, online = 0 where projeto_id = k.projeto_id;
      n := n + 1; continue;
    end if;

    -- Bug ou sugestão
    if t = 'feedback' then
      if coalesce(d->>'mensagem', '') <> '' then
        insert into public.painel_feedback (projeto_id, tipo, mensagem, contato)
        values (k.projeto_id, case when d->>'tipo' = 'sugestao' then 'sugestao' else 'bug' end, left(d->>'mensagem', 2000), left(coalesce(nullif(d->>'contato', ''), nm), 200));
        n := n + 1;
      end if;
      continue;
    end if;

    -- Ficha do jogador/usuário
    if u <> '' then
      insert into public.painel_jogadores as j (projeto_id, usuario, nome, plataforma, primeiro_em, visto_em, online_ate)
      values (k.projeto_id, u, nm, pl, quando, quando, case when t = 'saiu' or not recente then null else agora + interval '2 minutes' end)
      on conflict (projeto_id, usuario) do update set
        nome = case when excluded.nome <> '' then excluded.nome else j.nome end,
        plataforma = case when excluded.plataforma <> '' then excluded.plataforma else j.plataforma end,
        primeiro_em = least(j.primeiro_em, excluded.primeiro_em),
        visto_em = greatest(j.visto_em, excluded.visto_em),
        online_ate = case when t = 'saiu' then agora when not recente then j.online_ate else agora + interval '2 minutes' end;

      if t in ('cadastro', 'login') then
        update public.painel_jogadores set metodo = left(lower(coalesce(nullif(d->>'metodo', ''), 'email')), 20)
         where projeto_id = k.projeto_id and usuario = u and (t = 'cadastro' or metodo = '');
      elsif t = 'assinatura' then
        pln := left(lower(coalesce(nullif(d->>'plano', ''), 'mensal')), 20);
        st := left(lower(coalesce(nullif(d->>'status', ''), 'ativa')), 20);
        v := coalesce(painel_priv.num(d->>'valor'), 0);
        exp := coalesce(painel_priv.ts(d->>'expira_em'), quando + case pln when 'anual' then interval '1 year' when 'semanal' then interval '7 days' when 'vitalicio' then interval '100 years' else interval '1 month' end);
        update public.painel_jogadores set plano = pln, plano_status = st,
          plano_valor = case when st in ('cancelada', 'expirada', 'reembolsada') then plano_valor else v end,
          plano_expira = case when st in ('expirada', 'reembolsada') then agora when st = 'cancelada' then coalesce(plano_expira, agora) else exp end,
          gasto = gasto + case when st in ('ativa', 'renovada', 'nova') then v when st = 'reembolsada' then -v else 0 end
         where projeto_id = k.projeto_id and usuario = u;
      elsif t = 'transacao' then
        v := coalesce(painel_priv.num(d->>'valor'), 0);
        update public.painel_jogadores set gasto = gasto + case when d->>'tipo' = 'reembolso' then -v else v end
         where projeto_id = k.projeto_id and usuario = u;
      elsif t = 'partida' then
        update public.painel_jogadores set partidas = partidas + 1 where projeto_id = k.projeto_id and usuario = u;
      end if;
    end if;

    -- ping e saiu só atualizam quem está online; o resto vira evento
    if t not in ('ping', 'saiu') then
      insert into public.painel_eventos (projeto_id, tipo, usuario, plataforma, dados, criado_em)
      values (k.projeto_id, t, u, pl, case when nm <> '' then d || jsonb_build_object('nome', nm) else d end, quando);
    end if;
    n := n + 1;
  end loop;
  return jsonb_build_object('ok', true, 'recebidos', n);
end $$;
revoke all on function public.painel_enviar(text, jsonb) from public;
grant execute on function public.painel_enviar(text, jsonb) to anon, authenticated;
revoke all on function painel_priv.num(text) from public;
revoke all on function painel_priv.ts(text) from public;

-- Agora os apps só enviam dados com chave (fecha o envio aberto antigo)
drop policy if exists "apps enviam eventos" on public.painel_eventos;
drop policy if exists "apps enviam feedback" on public.painel_feedback;

-- Libera os novos tipos de evento e aumenta alguns limites da tabela antiga
alter table public.painel_eventos drop constraint if exists painel_eventos_tipo_check, add constraint painel_eventos_tipo_check check (tipo ~ '^[a-z_]{2,30}$');
alter table public.painel_eventos drop constraint if exists painel_eventos_plataforma_check, add constraint painel_eventos_plataforma_check check (char_length(plataforma) <= 30);
alter table public.painel_eventos drop constraint if exists painel_eventos_usuario_check, add constraint painel_eventos_usuario_check check (char_length(usuario) <= 100);
alter table public.painel_eventos drop constraint if exists painel_eventos_dados_check, add constraint painel_eventos_dados_check check (pg_column_size(dados) < 8000);
alter table public.painel_feedback drop constraint if exists painel_feedback_contato_check, add constraint painel_feedback_contato_check check (char_length(contato) <= 200);

-- Tipo "Site" para projetos e ideias
alter table public.painel_projetos drop constraint if exists painel_projetos_tipo_check, add constraint painel_projetos_tipo_check check (tipo = any (array['App','Jogo','Site']));
alter table public.painel_ideias drop constraint if exists painel_ideias_categoria_check, add constraint painel_ideias_categoria_check check (categoria = any (array['Jogo','App','Site','Manhwa','Outro']));
