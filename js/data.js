/* Camada de dados: Supabase (de verdade) ou demonstração (localStorage). */
window.Store = (() => {
  const LIST = ['projetos', 'tarefas', 'versoes', 'ideias', 'receita', 'eventos', 'feedback'];
  const BACKUP = ['projetos', 'tarefas', 'versoes', 'ideias', 'receita'];
  const T = t => 'painel_' + t;
  const state = {}; LIST.forEach(t => state[t] = []);
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
    const password = String(code).replace(/\s+/g, '').toUpperCase();
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
    mode = null; LIST.forEach(t => state[t] = []);
  }
  function useSb() { mode = 'sb'; }
  function useDemo() { mode = 'demo'; }

  /* ---------- Carregar ---------- */
  async function load() {
    if (mode === 'demo') { Object.assign(state, demoLoad()); return state; }
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
    if (t === 'projetos') ['tarefas', 'versoes', 'receita', 'eventos', 'feedback'].forEach(x => state[x] = state[x].filter(r => r.projeto_id !== id));
    if (mode === 'demo') demoSave();
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

  return { state, session, signIn, signUp, google, signOut, useSb, useDemo, load, add, addMany, upd, del, live, inject, backup, restore, demoReset, get mode() { return mode; }, get ready() { return !!client(); } };
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
