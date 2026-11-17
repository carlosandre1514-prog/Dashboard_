/* Camada de dados: Supabase (de verdade) ou demonstração (localStorage). */
window.Store = (() => {
  const LIST = ['projetos', 'tarefas', 'versoes', 'ideias', 'receita', 'eventos', 'feedback'];
  const BACKUP = ['projetos', 'tarefas', 'versoes', 'ideias', 'receita'];
  const T = t => 'painel_' + t;
  const state = { chaves: [], chavesErro: '' }; LIST.forEach(t => state[t] = []);
  let sb = null, mode = null;
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now());

  function client() {
    if (sb) return sb;
    const c = window.PAINEL_CONFIG;
    if (!window.supabase || !c) return null;
    try { sb = window.supabase.createClient(c.supabaseUrl, c.supabaseKey, { auth: { storage: window.sessionStorage } }); } catch (e) { sb = null; }
    return sb;
  }
  const need = () => { const c = client(); if (!c) throw new Error('Não deu para carregar o Supabase. Verifique a internet.'); return c; };

  async function session() {
    const c = client(); if (!c) return null;
    try { const { data } = await c.auth.getSession(); return data.session; } catch (e) { return null; }
  }
  // Painel de um dono só: o código de acesso é a senha da conta única. A sessão some quando o app é fechado.
  async function signIn(code) {
    const password = String(code).replace(/\s+/g, '');
    const { data, error } = await need().auth.signInWithPassword({ email: window.PAINEL_CONFIG.email, password });
    if (error) throw error; mode = 'sb'; return data.session;
  }
  async function signUp(email, password) {
    const { data, error } = await need().auth.signUp({ email, password, options: { emailRedirectTo: location.href.split('#')[0] } });
    if (error) throw error; if (data.session) mode = 'sb'; return data;
  }
  async function google() {
    // Confere antes se o Google está ligado no Supabase; senão o navegador sai do painel e mostra um erro em JSON.
    const c = window.PAINEL_CONFIG;
    let ext = null;
    try {
      const r = await fetch(c.supabaseUrl + '/auth/v1/settings', { headers: { apikey: c.supabaseKey } });
      if (r.ok) ext = (await r.json()).external || null;
    } catch (e) {}
    if (ext && !ext.google) throw new Error('Unsupported provider: provider is not enabled');
    const { error } = await need().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href.split('#')[0] } });
    if (error) throw error;
  }
  async function signOut() {
    if (mode === 'sb') { try { await client().auth.signOut(); } catch (e) {} }
    mode = null; LIST.forEach(t => state[t] = []); state.chaves = []; memApps = null;
  }
  function useSb() { mode = 'sb'; }
  function useDemo() { mode = 'demo'; }

  /* ---------- Carregar ---------- */
  async function load() {
    if (mode === 'demo') { Object.assign(state, demoLoad()); await loadChaves(); return state; }
    const c = need();
    const since = new Date(); since.setMonth(since.getMonth() - 12);
    const tabs = ['projetos', 'tarefas', 'versoes', 'ideias', 'receita', 'feedback'];
    const res = await Promise.all(tabs.map(t => c.from(T(t)).select('*').order('criado_em', { ascending: false }).limit(5000)));
    res.forEach((r, i) => { if (r.error) throw r.error; state[tabs[i]] = r.data; });
    let ev = [], from = 0;
    for (;;) {
      const { data, error } = await c.from(T('eventos')).select('*').gte('criado_em', since.toISOString())
        .order('criado_em', { ascending: false }).range(from, from + 999);
      if (error) throw error;
      ev = ev.concat(data);
      if (data.length < 1000 || ev.length >= 20000) break;
      from += 1000;
    }
    state.eventos = ev;
    await loadChaves();
    return state;
  }

  /* ---------- Escrever ---------- */
  async function add(t, row) {
    if (mode === 'demo') { const r = { id: uid(), criado_em: new Date().toISOString(), ...row }; state[t].unshift(r); demoSave(); return r; }
    const { data, error } = await need().from(T(t)).insert(row).select().single();
    if (error) throw error; state[t].unshift(data); return data;
  }
  async function addMany(t, rows) {
    if (mode === 'demo') { const rs = rows.map(r => ({ id: uid(), criado_em: new Date().toISOString(), ...r })); state[t].unshift(...rs); demoSave(); return rs; }
    const { data, error } = await need().from(T(t)).insert(rows).select();
    if (error) throw error; state[t].unshift(...data); return data;
  }
  async function upd(t, id, patch) {
    const row = state[t].find(r => r.id === id);
    if (mode === 'demo') { Object.assign(row, patch); demoSave(); return row; }
    const { data, error } = await need().from(T(t)).update(patch).eq('id', id).select().single();
    if (error) throw error; Object.assign(row, data); return row;
  }
  async function del(t, id) {
    if (mode !== 'demo') { const { error } = await need().from(T(t)).delete().eq('id', id); if (error) throw error; }
    state[t] = state[t].filter(r => r.id !== id);
    if (t === 'projetos') ['tarefas', 'versoes', 'receita', 'eventos', 'feedback', 'chaves'].forEach(x => state[x] = state[x].filter(r => r.projeto_id !== id));
    if (mode === 'demo') demoSave();
  }

  /* ---------- Apps conectados (chaves + dados de cada app) ---------- */
  const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  const sha256 = async t => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)));
  function novaChave() { const b = new Uint8Array(24); crypto.getRandomValues(b); return 'pnl_' + hex(b); }
  const CH_COLS = 'id,projeto_id,nome,prefixo,ativa,ultimo_uso,usos,criado_em';
  async function loadChaves() {
    if (mode === 'demo') { state.chaves = demoApps().chaves; state.chavesErro = ''; return; }
    try {
      const { data, error } = await need().from(T('chaves')).select(CH_COLS).order('criado_em', { ascending: false });
      if (error) throw error; state.chaves = data; state.chavesErro = '';
    } catch (e) { state.chaves = []; state.chavesErro = e.message || String(e); }
  }
  async function addChave(projeto_id, nome, chave) {
    chave = String(chave).trim();
    if (chave.length < 20 || chave.length > 200) throw new Error('A chave precisa ter entre 20 e 200 caracteres.');
    const row = { projeto_id, nome: nome || 'Chave principal', prefixo: chave.slice(0, 8), hash: await sha256(chave) };
    if (mode === 'demo') { const r = { id: uid(), ativa: true, usos: 0, ultimo_uso: null, criado_em: new Date().toISOString(), ...row }; delete r.hash; state.chaves.unshift(r); return r; }
    const { data, error } = await need().from(T('chaves')).insert(row).select(CH_COLS).single();
    if (error) throw new Error(error.code === '23505' ? 'Essa chave já está cadastrada.' : error.message);
    state.chaves.unshift(data); return data;
  }
  async function updChave(id, patch) {
    const row = state.chaves.find(r => r.id === id);
    if (mode !== 'demo') { const { error } = await need().from(T('chaves')).update(patch).eq('id', id); if (error) throw error; }
    Object.assign(row, patch); return row;
  }
  async function delChave(id) {
    if (mode !== 'demo') { const { error } = await need().from(T('chaves')).delete().eq('id', id); if (error) throw error; }
    state.chaves = state.chaves.filter(r => r.id !== id);
  }
  async function appLive(pid) {
    if (mode === 'demo') { const d = demoApps().dados(pid); return { jogadores: d.jogadores, servidor: d.servidor }; }
    const c = need();
    const [j, s] = await Promise.all([
      c.from(T('jogadores')).select('*').eq('projeto_id', pid).order('visto_em', { ascending: false }).limit(10000),
      c.from(T('servidor')).select('*').eq('projeto_id', pid).maybeSingle()
    ]);
    if (j.error) throw j.error; if (s.error) throw s.error;
    return { jogadores: j.data, servidor: s.data };
  }
  async function appData(pid) {
    if (mode === 'demo') return demoApps().dados(pid);
    const c = need(), since = new Date(Date.now() - 90 * 864e5).toISOString(), dia = new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 10);
    const [live, up] = await Promise.all([appLive(pid), c.from(T('uptime')).select('*').eq('projeto_id', pid).gte('dia', dia)]);
    if (up.error) throw up.error;
    let ev = [], from = 0;
    for (;;) {
      const { data, error } = await c.from(T('eventos')).select('*').eq('projeto_id', pid).gte('criado_em', since)
        .order('criado_em', { ascending: false }).range(from, from + 999);
      if (error) throw error;
      ev = ev.concat(data);
      if (data.length < 1000 || ev.length >= 30000) break;
      from += 1000;
    }
    return { ...live, uptime: up.data, eventos: ev };
  }

  /* Dados de exemplo dos apps conectados (só no modo demonstração) */
  let memApps = null;
  function demoApps() {
    if (memApps) return memApps;
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pick = a => a[Math.floor(rnd() * a.length)], now = Date.now(), DAY = 864e5, iso = ms => new Date(ms).toISOString();
    const pid = (state.projetos.find(p => p.nome === 'Favela Game') || state.projetos[0] || {}).id;
    const NOMES = ['Sniper_BR', 'LiaGamer', 'MCzinho', 'Tropa_do_K', 'Dona_Bala', 'ZéPistola', 'Fumaça', 'Mano_RJ', 'Vapor', 'Neguin_SP', 'Kaká', 'Brabo10', 'Rato_Cinza', 'Bia_Fps', 'Tigrão'];
    const jog = [], ev = [], up = [];
    for (let i = 0; i < 260; i++) {
      const first = now - rnd() * 88 * DAY, seen = Math.min(now, first + rnd() * 40 * DAY), on = rnd() < .09;
      const nome = i < NOMES.length ? NOMES[i] : pick(NOMES) + (100 + i), metodo = rnd() < .62 ? 'google' : rnd() < .7 ? 'email' : 'anonimo';
      const plano = rnd() < .14 ? (rnd() < .7 ? 'mensal' : 'anual') : '', valor = plano === 'anual' ? 199.9 : plano ? 19.9 : 0;
      const j = { projeto_id: pid, usuario: 'u' + i, nome, plataforma: pick(['Android', 'Android', 'Android', 'iOS', 'Web']), metodo, plano, plano_valor: valor, plano_status: plano ? (rnd() < .85 ? 'ativa' : 'cancelada') : '', plano_expira: plano ? iso(now + (rnd() * (plano === 'anual' ? 300 : 28) - 3) * DAY) : null, gasto: valor, partidas: 0, primeiro_em: iso(first), visto_em: iso(on ? now - rnd() * 60e3 : seen), online_ate: on ? iso(now + 90e3) : null };
      jog.push(j);
      ev.push({ id: 'e' + ev.length, projeto_id: pid, tipo: 'cadastro', usuario: j.usuario, plataforma: j.plataforma, dados: { metodo, nome }, criado_em: j.primeiro_em });
      if (plano) ev.push({ id: 'e' + ev.length, projeto_id: pid, tipo: 'assinatura', usuario: j.usuario, plataforma: j.plataforma, dados: { plano, valor, status: 'ativa', nome }, criado_em: iso(first + rnd() * (now - first)) });
      const nt = Math.floor(rnd() * rnd() * 6);
      for (let t = 0; t < nt; t++) { const it = pick([['100 moedas', 4.9], ['500 moedas', 19.9], ['Skin Dourada', 9.9], ['Passe de batalha', 14.9]]); j.gasto += it[1]; ev.push({ id: 'e' + ev.length, projeto_id: pid, tipo: 'transacao', usuario: j.usuario, plataforma: j.plataforma, dados: { valor: it[1], item: it[0], nome }, criado_em: iso(first + rnd() * (now - first)) }); }
      const np = Math.floor(rnd() * 14);
      for (let t = 0; t < np; t++) { j.partidas++; ev.push({ id: 'e' + ev.length, projeto_id: pid, tipo: 'partida', usuario: j.usuario, plataforma: j.plataforma, dados: { nome, abates: Math.floor(rnd() * 20), vitoria: rnd() < .4, minutos: 4 + Math.floor(rnd() * 12), modo: pick(['Solo', 'Dupla', 'Squad']) }, criado_em: iso(first + rnd() * (now - first)) }); }
      if (rnd() < .25) ev.push({ id: 'e' + ev.length, projeto_id: pid, tipo: 'presente', usuario: j.usuario, plataforma: j.plataforma, dados: { nome, para: pick(NOMES), item: pick(['Rosa', 'Caixa surpresa', 'Diamante', 'Coroa']), valor: pick([1, 2, 5, 10]) }, criado_em: iso(first + rnd() * (now - first)) });
    }
    for (let d = 30; d >= 0; d--) up.push({ projeto_id: pid, dia: new Date(now - d * DAY).toISOString().slice(0, 10), segundos: d === 0 ? Math.round((new Date().getHours() + new Date().getMinutes() / 60) * 3600) : Math.round((rnd() < .1 ? 14 + rnd() * 8 : 23 + rnd()) * 3600), pico_online: 20 + Math.floor(rnd() * 40) });
    ev.sort((a, b) => b.criado_em.localeCompare(a.criado_em));
    const servidor = { projeto_id: pid, online: jog.filter(j => j.online_ate).length, ativo: true, ativo_desde: iso(now - 5.3 * 3600e3), ultimo_sinal: iso(now - 20e3), versao: '0.3.0', dados: {} };
    memApps = { chaves: pid ? [{ id: 'k1', projeto_id: pid, nome: 'Servidor do jogo', prefixo: 'pnl_8f3a', ativa: true, usos: 18342, ultimo_uso: iso(now - 20e3), criado_em: iso(now - 60 * DAY) }] : [],
      dados: p => p === pid ? { jogadores: jog, servidor, uptime: up, eventos: ev } : { jogadores: [], servidor: null, uptime: [], eventos: [] } };
    return memApps;
  }

  /* ---------- Tempo real ---------- */
  let ch = null;
  function live(cb) {
    if (mode !== 'sb' || ch) return;
    ch = client().channel('painel-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'painel_eventos' }, p => { state.eventos.unshift(p.new); cb('eventos', p.new); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'painel_feedback' }, p => { state.feedback.unshift(p.new); cb('feedback', p.new); })
      .subscribe();
  }
  function inject(t, row) { state[t].unshift(row); if (mode === 'demo') demoSave(); }

  /* ---------- Backup ---------- */
  function backup() {
    const o = { app: 'painel-de-projetos', versao: 1, exportado_em: new Date().toISOString() };
    BACKUP.forEach(t => o[t] = state[t].map(({ owner, ...r }) => r));
    return o;
  }
  async function restore(o) {
    if (!o || o.app !== 'painel-de-projetos') throw new Error('Esse arquivo não é um backup do painel.');
    if (mode === 'demo') { BACKUP.forEach(t => { if (Array.isArray(o[t])) state[t] = o[t]; }); demoSave(); return; }
    for (const t of BACKUP) {
      if (!Array.isArray(o[t]) || !o[t].length) continue;
      const rows = o[t].map(({ owner, ...r }) => r);
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await need().from(T(t)).upsert(rows.slice(i, i + 500), { onConflict: 'id' });
        if (error) throw error;
      }
    }
    await load();
  }

  /* ---------- Demonstração ---------- */
  const KEY = 'painel_demo_v2';
  let memDemo = null;
  function demoSave() {
    memDemo = {}; LIST.forEach(t => memDemo[t] = state[t]);
    try { localStorage.setItem(KEY, JSON.stringify(memDemo)); } catch (e) {}
  }
  function demoLoad() {
    if (memDemo) return memDemo;
    try { const s = localStorage.getItem(KEY); if (s) return (memDemo = JSON.parse(s)); } catch (e) {}
    memDemo = demoSeed(); try { localStorage.setItem(KEY, JSON.stringify(memDemo)); } catch (e) {}
    return memDemo;
  }
  function demoReset() { memDemo = null; try { localStorage.removeItem(KEY); } catch (e) {} }

  function demoSeed() {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pick = a => a[Math.floor(rnd() * a.length)];
    const now = Date.now(), DAY = 864e5, iso = ms => new Date(ms).toISOString();
    const day = n => { const d = new Date(now + n * DAY); return d.toISOString().slice(0, 10); };
    const P = window.MEUS_PROJETOS.map((p, i) => ({ id: 'p' + (i + 1), criado_em: iso(now - (400 - i * 20) * DAY), notas: '', ...p }));
    const id = n => P.find(p => p.nome === n).id;
    const base = { 'Favela Game': 124, 'Manhwa Toons': 160, 'Agenda Barba': 86, 'Cabeção Sorteios Pro': 54, 'Sorteador de Times': 41, 'Controle Financeiro': 32 };
    const nomes = ['Sniper_BR', 'Jogador_Rato', 'MandraKe', 'Fumaça', 'Zé_do_Morro', 'LobaSolitária', 'PretoVelho', 'Kauã_AK', 'Neguinho_FF', 'RainhaDoBaile', 'Biel', 'Tiroteio', 'Menor_MT', 'Faísca', 'Chapa_Quente'];
    const ev = [];
    for (const [n, users] of Object.entries(base)) {
      const pid = id(n);
      for (let u = 0; u < users; u++) {
        const user = n === 'Favela Game' && u < nomes.length ? nomes[u] : 'u' + Math.floor(rnd() * 1e6).toString(36);
        const plat = rnd() < .68 ? 'Android' : rnd() < .8 ? 'Web' : 'iOS';
        const start = Math.floor(Math.pow(rnd(), 1.7) * 360);
        const t0 = now - start * DAY;
        ev.push({ projeto_id: pid, tipo: 'instalar', usuario: user, plataforma: plat, dados: {}, criado_em: iso(t0) });
        if (rnd() < .6) ev.push({ projeto_id: pid, tipo: 'cadastro', usuario: user, plataforma: plat, dados: {}, criado_em: iso(t0 + 6e5) });
        const sess = 1 + Math.floor(rnd() * 6);
        for (let s = 0; s < sess; s++) {
          const t = t0 + rnd() * start * DAY;
          ev.push({ projeto_id: pid, tipo: 'abrir', usuario: user, plataforma: plat, dados: {}, criado_em: iso(t) });
          if (n === 'Favela Game') { const k = Math.floor(rnd() * (u < 15 ? 25 : 12)); ev.push({ projeto_id: pid, tipo: 'partida', usuario: user, plataforma: plat, dados: { nome: user, abates: k, vitoria: rnd() < (u < 15 ? .55 : .3), minutos: 4 + Math.floor(rnd() * 10) }, criado_em: iso(t + 3e5) }); }
        }
        if (rnd() < .05) ev.push({ projeto_id: pid, tipo: 'erro', usuario: user, plataforma: plat, dados: { mensagem: pick(['TypeError: undefined', 'Falha ao carregar capítulo', 'Timeout no servidor']) }, criado_em: iso(t0 + rnd() * start * DAY) });
      }
    }
    ev.sort((a, b) => b.criado_em.localeCompare(a.criado_em));
    ev.forEach((e, i) => e.id = i + 1);
    const T = (titulo, p, pr, col, prazo) => ({ id: uid(), projeto_id: id(p), titulo, prioridade: pr, coluna: col, prazo: prazo == null ? null : day(prazo), criado_em: iso(now - 5 * DAY) });
    const tarefas = [T('Arrumar lag no multiplayer', 'Favela Game', 'a', 1, 2), T('Novo mapa da favela', 'Favela Game', 'm', 0, 12), T('Botão de pausa no FPS', 'Jogo 3D FPS', 'b', 0, null), T('Notificação de capítulo novo', 'Manhwa Toons', 'm', 0, 6), T('Pagamento por Pix no agendamento', 'Agenda Barba', 'a', 1, -1), T('Modo escuro', 'Controle Financeiro', 'b', 2, null), T('Pareamento por PIN na TV', 'Navegador Híbrido', 'm', 1, 9), T('Alerta de blitz em tempo real', 'Mapa Motoboy', 'a', 0, 20)];
    const V = (p, versao, texto, d) => ({ id: uid(), projeto_id: id(p), versao, texto, criado_em: iso(now - d * DAY) });
    const versoes = [V('Cabeção Sorteios Pro', 'v1.1.0', 'Nova versão enviada pro GitHub pelo Termux.', 0.1), V('Favela Game', 'v0.3.0', 'Multiplayer online e instalação como app (PWA).', 1), V('Manhwa Toons', 'v1.0.0', 'Painel administrativo e leitor de capítulos.', 5), V('Agenda Barba', 'v1.2.0', 'Área do cliente e agenda por cidade.', 14)];
    const I = (titulo, categoria, texto, d) => ({ id: uid(), titulo, categoria, texto, criado_em: iso(now - d * DAY) });
    const ideias = [I('Manhwa de espadas', 'Manhwa', 'Protagonista começa fraco e vira mestre espadachim. Fantasia medieval com cavaleiros e lordes.', 3), I('Modo zumbi no Favela Game', 'Jogo', 'Ondas de zumbis à noite, jogar em dupla.', 6), I('App de treino de futebol', 'App', 'Juntar com o Sorteador de Times: presença, gols e ranking da pelada.', 10)];
    const F = (p, tipo, mensagem, contato, d, ok) => ({ id: uid(), projeto_id: id(p), tipo, mensagem, contato, resolvido: !!ok, criado_em: iso(now - d * DAY) });
    const feedback = [F('Favela Game', 'bug', 'Quando morro e renasço a arma some.', 'Sniper_BR', 0.05), F('Manhwa Toons', 'sugestao', 'Coloca modo de leitura na horizontal!', 'lia@email.com', 0.4), F('Agenda Barba', 'bug', 'Horário das 18h aparece duplicado.', '', 2), F('Sorteador de Times', 'sugestao', 'Salvar os times da semana passada.', '', 4), F('Favela Game', 'bug', 'Travou no celular Samsung A10.', '', 9, true)];
    const receita = [];
    const R = { 'Manhwa Toons': ['Anúncios', 320, 25], 'Agenda Barba': ['Assinaturas', 280, 0], 'Favela Game': ['Anúncios', 150, 40], 'Cabeção Sorteios Pro': ['Anúncios', 90, 0] };
    for (let m = 11; m >= 0; m--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - m);
      const g = .35 + .65 * (11 - m) / 11;
      for (const [n, [f, v, c]] of Object.entries(R)) receita.push({ id: uid(), projeto_id: id(n), mes: d.toISOString().slice(0, 7) + '-01', fonte: f, valor: Math.round(v * g * (0.9 + rnd() * .2)), custo: c, criado_em: iso(d.getTime()) });
    }
    receita.reverse();
    return { projetos: P, tarefas, versoes, ideias, receita, eventos: ev, feedback };
  }

  return { state, session, signIn, signUp, google, signOut, novaChave, addChave, updChave, delChave, loadChaves, appData, appLive, useSb, useDemo, load, add, addMany, upd, del, live, inject, backup, restore, demoReset, get mode() { return mode; }, get ready() { return !!client(); } };
})();

/* Seus projetos (usados na importação e na demonstração) */
window.MEUS_PROJETOS = [
  { nome: 'Favela Game', tipo: 'Jogo', tecnologia: 'Node + Three.js · PWA', status: 1, progresso: 65, github: 'carlosandre1514-prog/favela-game', url_app: '' },
  { nome: 'Jogo 3D FPS', tipo: 'Jogo', tecnologia: 'Android', status: 0, progresso: 10, github: '', url_app: '' },
  { nome: 'Manhwa Toons', tipo: 'App', tecnologia: 'HTML/JS + Firebase', status: 2, progresso: 85, github: '', url_app: '' },
  { nome: 'Agenda Barba', tipo: 'App', tecnologia: 'Supabase + GitHub Pages', status: 2, progresso: 90, github: '', url_app: '' },
  { nome: 'Cabeção Sorteios Pro', tipo: 'App', tecnologia: 'v1.1.0', status: 2, progresso: 100, github: '', url_app: '' },
  { nome: 'Sorteador de Times', tipo: 'App', tecnologia: 'PWA', status: 2, progresso: 80, github: '', url_app: '' },
  { nome: 'Controle Financeiro', tipo: 'App', tecnologia: 'PWA + Chart.js', status: 2, progresso: 95, github: '', url_app: '' },
  { nome: 'Navegador Híbrido', tipo: 'App', tecnologia: 'Flutter + Firebase', status: 1, progresso: 45, github: '', url_app: '' },
  { nome: 'Mapa Motoboy', tipo: 'App', tecnologia: 'Mapa colaborativo', status: 1, progresso: 30, github: '', url_app: '' },
  { nome: 'Mark LV Android', tipo: 'App', tecnologia: 'Python + Gemini', status: 1, progresso: 35, github: '', url_app: '' },
  { nome: 'App de Mensagens', tipo: 'App', tecnologia: 'Android e iOS', status: 0, progresso: 15, github: '', url_app: '' },
  { nome: 'App de Desenho', tipo: 'App', tecnologia: 'Pincel, camadas, cores', status: 0, progresso: 20, github: '', url_app: '' }
];
