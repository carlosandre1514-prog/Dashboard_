{
/* ================= Utilidades ================= */
const $ = id => document.getElementById(id);
const S = Store.state;
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ini = n => String(n || '?').replace(/[_.\-@]/g, ' ').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase() || '?';
const num = n => Number(n || 0).toLocaleString('pt-BR');
const fmt = n => 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const k1 = v => v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : String(Math.round(v));
const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DAY = 864e5;
const mk = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0'); };
const months12 = () => { const a = []; const d = new Date(); d.setDate(1); for (let i = 11; i >= 0; i--) { const x = new Date(d); x.setMonth(d.getMonth() - i); a.push(mk(x)); } return a; };
const mlabel = k => MES[+k.slice(5) - 1];
const today = () => new Date().toISOString().slice(0, 10);
function ago(t) {
  const s = (Date.now() - new Date(t)) / 1000;
  if (s < 60) return 'agora'; if (s < 3600) return 'há ' + Math.floor(s / 60) + ' min';
  if (s < 86400) return 'há ' + Math.floor(s / 3600) + ' h'; if (s < 172800) return 'ontem';
  if (s < 2592000) return 'há ' + Math.floor(s / 86400) + ' dias';
  return new Date(t).toLocaleDateString('pt-BR');
}
const shortUser = u => /^[0-9a-f-]{20,}$/i.test(u || '') ? 'Usuário ' + u.slice(0, 6) : (u || 'Anônimo');
let tt; function toast(m) { $('toast').textContent = m; $('toast').classList.add('on'); clearTimeout(tt); tt = setTimeout(() => $('toast').classList.remove('on'), 2600); }
async function act(fn, ok) { try { const r = await fn(); if (ok) toast(ok); return r; } catch (e) { console.error(e); toast('Erro: ' + (e.message || e)); } }

/* Preferências (ficam neste aparelho) */
const PREF_KEY = 'painel_prefs';
const prefs = Object.assign({ nome: 'Carlos André', github: 'carlosandre1514-prog', meta: 1000, modo: 'escuro', acc: '#22d3ee', nots: { cadastro: 1, erro: 1, feedback: 1 } }, (() => { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (e) { return {}; } })());
const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} };

/* Ícones */
const I = { home: '<path d="M3 11 12 3l9 8v10H3z"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', task: '<path d="M9 11l3 3 8-8M20 12v7H4V5h11"/>', team: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 0 1 0 8"/>', money: '<path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>', bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>', game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13h.01"/>', phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>', down: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>', code: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4"/>', bug: '<rect x="7" y="7" width="10" height="13" rx="5"/><path d="M12 7V4M3 12h4M17 12h4M4 18l3-2M20 18l-3-2M4 6l3 2M20 6l-3 2"/>', star: '<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>', up: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>', trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>', bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>', msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m11 12 9-9M16 7l3 3M14 9l2 2"/>', gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M12 8S10 3 7.5 4.5 9 8 12 8zm0 0s2-5 4.5-3.5S15 8 12 8"/>' };
const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;
const stat = ([ic, v, l, ch]) => `<div class="c glass stat"><div class="row"><div class="ico">${svg(ic)}</div>${ch ? `<span class="chip ${String(ch)[0] === '-' ? 'dn' : 'up'}">${ch}</span>` : ''}</div><div class="v">${v}</div><div class="l">${l}</div></div>`;
const TIPO_IC = { Jogo: 'game', App: 'phone', Site: 'globe' }, tipoIc = t => TIPO_IC[t] || 'phone';
const TIPO_NOME = t => t === 'Site' ? 'Site / Web app' : t;
const picon = p => p.icone ? `<img src="${esc(p.icone)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.remove('has-img');this.nextElementSibling.hidden=false;this.remove()"><span hidden>${svg(tipoIc(p.tipo))}</span>` : svg(tipoIc(p.tipo));
const icoBox = (p, st) => `<div class="ico${p.icone ? ' has-img' : ''}"${st ? ` style="${st}"` : ''}>${picon(p)}</div>`;
const STS = ['Ideia', 'Em desenvolvimento', 'Lançado'], STC = ['rgba(150,170,175,.9)', '#fbbf24', '#34d399'];
const PR = { a: 'Alta', m: 'Média', b: 'Baixa' }, COLS = ['A fazer', 'Em andamento', 'Concluído'];

/* ================= Dados derivados ================= */
const proj = id => S.projetos.find(p => p.id === id);
const pname = id => proj(id)?.nome || '—';
const evOf = (pid, tipo) => S.eventos.filter(e => (!pid || e.projeto_id === pid) && (!tipo || e.tipo === tipo));
function activeByMonth(pid) { const m = {}; for (const e of evOf(pid, 'abrir')) { const k = mk(e.criado_em); (m[k] ||= new Set()).add(e.projeto_id + '|' + e.usuario); } return m; }
function countByMonth(pid, tipo) { const m = {}; for (const e of evOf(pid, tipo)) { const k = mk(e.criado_em); m[k] = (m[k] || 0) + 1; } return m; }
function users30(pid) { const lim = Date.now() - 30 * DAY, s = new Set(); for (const e of S.eventos) if ((!pid || e.projeto_id === pid) && new Date(e.criado_em) > lim) s.add(e.projeto_id + '|' + e.usuario); return s.size; }
const openBugs = () => S.feedback.filter(f => !f.resolvido);
function trend(cur, prev) { if (!prev) return ''; const v = Math.round((cur / prev - 1) * 100); return (v >= 0 ? '+' : '') + v + '%'; }

/* ================= Navegação ================= */
const NAV = [['overview', 'Visão geral', 'home'], ['projects', 'Projetos', 'grid'], ['apps', 'Apps conectados', 'key'], ['reports', 'Métricas', 'chart'], ['tasks', 'Tarefas', 'task', 'tasks'], ['bugs', 'Bugs', 'bug', 'bugs'], ['ranking', 'Ranking', 'trophy'], ['team', 'Usuários', 'team'], ['finance', 'Receita', 'money'], ['ideas', 'Ideias', 'bulb'], ['announcements', 'Atualizações', 'up'], ['settings', 'Configurações', 'gear']];
const VIEWS = NAV.map(n => n[0]);
$('nav').innerHTML = NAV.map(([id, t, ic, b]) => `<button class="nav" data-v="${id}">${svg(ic)}${t}${b ? `<span class="n" id="nb-${b}"></span>` : ''}</button>`).join('');
let view = 'overview';
function go() {
  let v = location.hash.slice(1); if (!VIEWS.includes(v)) v = 'overview'; view = v;
  document.querySelectorAll('.view').forEach(e => e.classList.toggle('on', e.id === 'v-' + v));
  document.querySelectorAll('.nav').forEach(e => e.classList.toggle('on', e.dataset.v === v));
  document.body.classList.remove('open');
  if (v === 'apps' && !$('shell').hidden) openApps();
  drawAll();
}
const nav = v => { if (location.hash !== '#' + v) location.hash = v; go(); };
$('nav').onclick = e => { const b = e.target.closest('.nav'); if (b) nav(b.dataset.v); };
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) nav(b.dataset.go); });
addEventListener('hashchange', go);
$('menu').onclick = () => document.body.classList.add('open');
$('scrim').onclick = () => document.body.classList.remove('open');
$('bell').onclick = () => nav('bugs');
addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); $('q').focus(); }
  if (e.key === 'Escape' && !$('drawer').hidden) closeDrawer();
});
const seg = (id, fn) => $(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; $(id).querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); fn(b.textContent.trim()); };

/* ================= Gráficos ================= */
function barChart(s, vals, labels, money) {
  const W = s.clientWidth, H = s.clientHeight; if (!W) return;
  const small = W < 420, pl = small ? 8 : 52, pb = 26, pt = 10, mx = Math.max(...vals, 1) * 1.15, n = vals.length, bw = (W - pl) / n;
  const lab = v => money ? 'R$' + k1(v) : k1(v);
  let o = '';
  if (!small) for (let i = 0; i <= 4; i++) { const y = pt + (H - pt - pb) * i / 4; o += `<line x1="${pl}" x2="${W}" y1="${y}" y2="${y}" class="grid-l" stroke-dasharray="3 4"/><text x="${pl - 8}" y="${y + 4}" text-anchor="end" font-size="11" class="tx">${lab(mx * (1 - i / 4))}</text>`; }
  o += '<defs><linearGradient id="g' + s.id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--acc)"/><stop offset="1" style="stop-color:var(--acc);stop-opacity:.3"/></linearGradient></defs>';
  vals.forEach((v, i) => {
    const bh = Math.max(0, (H - pt - pb) * v / mx), x = pl + i * bw + bw * .22, w = bw * .56, last = i === n - 1;
    o += `<rect x="${x}" y="${H - pb - bh}" width="${w}" height="${bh}" rx="${Math.min(8, w / 3)}" style="fill:${last ? 'var(--acc)' : 'url(#g' + s.id + ')'}" opacity="${last ? 1 : .8}"><title>${labels[i]}: ${money ? fmt(v) : num(v)}</title></rect>`;
    if (!small || n <= 6 || i % 2 === 0) o += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" font-size="11" class="tx">${labels[i]}</text>`;
  });
  s.innerHTML = o;
}
const DC = ['#22d3ee', '#34d399', '#fbbf24', '#fb7185'];
function donutData() {
  const L = S.projetos.map(p => [p.nome, users30(p.id)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
  const top = L.slice(0, 3).map((x, i) => [x[0], DC[i], x[1]]); const rest = L.slice(3).reduce((a, x) => a + x[1], 0);
  if (rest) top.push(['Outros', DC[3], rest]); return top;
}
function donut(s) {
  const W = s.clientWidth, H = s.clientHeight; if (!W) return;
  const D = donutData(), r = Math.min(W, H) / 2 - 14, cx = W / 2, cy = H / 2, C = 2 * Math.PI * r, t = D.reduce((a, b) => a + b[2], 0);
  let off = 0, o = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--line)" stroke-width="18"/>`;
  D.forEach(([n, c, v]) => { const L = C * v / t; o += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${Math.max(L - 4, 1)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="round"><title>${esc(n)}: ${num(v)}</title></circle>`; off += L; });
  s.innerHTML = o + `<text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="20" font-weight="800" class="tx-ink">${num(t)}</text><text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="11" class="tx">usuários</text>`;
  $('leg').innerHTML = D.length ? D.map(([n, c, v]) => `<span><i style="background:${c}"></i>${esc(n)}<b>${k1(v)}</b></span>`).join('') : '<span style="grid-column:1/-1;color:var(--mut)">Sem dados dos apps ainda.</span>';
}
function ring(s, p) {
  const W = s.clientWidth, H = s.clientHeight; if (!W) return;
  const r = Math.min(W, H) / 2 - 14, cx = W / 2, cy = H / 2, C = 2 * Math.PI * r;
  s.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--line)" stroke-width="16"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--acc)" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C * Math.min(p, 1)} ${C}" transform="rotate(-90 ${cx} ${cy})"/><text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="26" font-weight="800" class="tx-ink">${Math.round(p * 100)}%</text>`;
}
function lineChart(s) {
  const W = s.clientWidth, H = s.clientHeight; if (!W) return;
  const pid = $('rproj').value || null, M = months12(), ins = countByMonth(pid, 'instalar'), act = activeByMonth(pid);
  const a = M.map(k => ins[k] || 0), b = M.map(k => act[k]?.size || 0);
  const small = W < 420, pl = small ? 8 : 44, pb = 26, pt = 12, mx = Math.max(...a, ...b, 1) * 1.15, n = 12, sx = i => pl + (W - pl - 10) * i / (n - 1), sy = v => pt + (H - pt - pb) * (1 - v / mx);
  let o = '';
  if (!small) for (let i = 0; i <= 3; i++) { const v = mx * i / 3; o += `<line x1="${pl}" x2="${W}" y1="${sy(v)}" y2="${sy(v)}" class="grid-l" stroke-dasharray="3 4"/><text x="${pl - 8}" y="${sy(v) + 4}" text-anchor="end" font-size="11" class="tx">${k1(v)}</text>`; }
  const path = d => d.map((v, i) => (i ? 'L' : 'M') + sx(i) + ' ' + sy(v)).join('');
  o += `<path d="${path(a)} L${sx(n - 1)} ${H - pb} L${sx(0)} ${H - pb}Z" style="fill:var(--acc);fill-opacity:.15"/><path d="${path(a)}" fill="none" style="stroke:var(--acc)" stroke-width="3"/><path d="${path(b)}" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="6 5"/>`;
  a.forEach((v, i) => { o += `<circle cx="${sx(i)}" cy="${sy(v)}" r="4" style="fill:var(--acc)"><title>${mlabel(M[i])}: ${num(v)} instalações, ${num(b[i])} ativos</title></circle>`; if (!small || i % 2 === 0) o += `<text x="${sx(i)}" y="${H - 8}" text-anchor="middle" font-size="11" class="tx">${small ? mlabel(M[i])[0] : mlabel(M[i])}</text>`; });
  s.innerHTML = o;
}
let range = 6;
seg('range', t => { range = parseInt(t); drawAll(); });
function drawAll() {
  if ($('shell').hidden) return;
  const M = months12(), act = activeByMonth(null), all = M.map(k => act[k]?.size || 0);
  const v = all.slice(-range), l = M.slice(-range).map(mlabel);
  $('comTot').textContent = num(v[v.length - 1]) + ' este mês · todos os projetos';
  if (view === 'overview') { barChart($('bars'), v, l); donut($('donut')); }
  if (view === 'finance') { const L = profitByMonth(); barChart($('fbars'), L.map(x => x[1]), L.map(x => innerWidth < 600 ? mlabel(x[0])[0] : mlabel(x[0])), 1); ring($('ring'), monthRevenue() / (prefs.meta || 1)); }
  if (view === 'reports') lineChart($('line'));
  if (view === 'apps') drawApp();
}
document.querySelectorAll('.fig').forEach(f => new ResizeObserver(() => drawAll()).observe(f));

/* ================= Visão geral ================= */
function renderOverview() {
  const h = new Date().getHours(), first = (prefs.nome || 'Carlos').split(' ')[0];
  $('greet').textContent = (h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite') + ', ' + first;
  $('date').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · resumo dos seus apps e jogos';
  const P = S.projetos, live = P.filter(p => p.status == 2).length;
  const lim = Date.now() - 30 * DAY, lim2 = Date.now() - 60 * DAY;
  const inst30 = S.eventos.filter(e => e.tipo === 'instalar' && new Date(e.criado_em) > lim).length;
  const inst60 = S.eventos.filter(e => e.tipo === 'instalar' && new Date(e.criado_em) > lim2 && new Date(e.criado_em) <= lim).length;
  $('stats').innerHTML = [['grid', P.length, 'Projetos no total'], ['up', live, 'Lançados'], ['code', P.filter(p => p.status == 1).length, 'Em desenvolvimento'], ['bulb', S.ideias.length, 'Ideias guardadas'],
    ['team', num(users30()), 'Usuários (30 dias)'], ['down', num(inst30), 'Instalações (30 dias)', trend(inst30, inst60)], ['task', S.tarefas.filter(t => t.coluna < 2).length, 'Tarefas abertas'], ['bug', openBugs().length, 'Bugs e sugestões abertos']].map(stat).join('');
  $('goalTxt').textContent = live + ' de ' + P.length + ' projetos lançados';
  $('goalBar').style.width = (P.length ? live / P.length * 100 : 0) + '%';
  const F = [...S.eventos.filter(e => e.tipo === 'cadastro' || e.tipo === 'erro').slice(0, 30).map(e => ({ t: e.criado_em, ic: e.tipo === 'erro' ? 'bug' : 'user', h: e.tipo === 'erro' ? 'Erro em ' + pname(e.projeto_id) : 'Novo cadastro em ' + pname(e.projeto_id), s: e.tipo === 'erro' ? (e.dados?.mensagem || 'Sem detalhes') : shortUser(e.usuario) + ' · ' + (e.plataforma || '') })),
    ...S.feedback.slice(0, 20).map(f => ({ t: f.criado_em, ic: 'msg', h: (f.tipo === 'bug' ? 'Bug' : 'Sugestão') + ' em ' + pname(f.projeto_id), s: f.mensagem }))]
    .sort((a, b) => String(b.t).localeCompare(String(a.t))).slice(0, 7);
  $('feed').innerHTML = F.length ? F.map(x => `<div class="li"><div class="ico">${svg(x.ic)}</div><div class="grow"><b>${esc(x.h)}</b><small>${esc(x.s)}</small></div><small>${ago(x.t)}</small></div>`).join('') : '<p class="empty">Quando seus apps enviarem dados, eles aparecem aqui.</p>';
  const soon = S.tarefas.filter(t => t.prazo && t.coluna < 2).sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 6);
  $('soon').innerHTML = soon.length ? soon.map(t => `<div class="li"><span class="tag pri-${t.prioridade}">${PR[t.prioridade]}</span><div class="grow"><b>${esc(t.titulo)}</b><small>${esc(pname(t.projeto_id))}</small></div>${prazoTag(t)}</div>`).join('') : '<p class="empty">Nenhuma tarefa com prazo.</p>';
}
function prazoTag(t) {
  if (!t.prazo) return ''; const late = t.coluna < 2 && t.prazo < today();
  const d = new Date(t.prazo + 'T12:00:00'); const diff = Math.round((d - new Date(today() + 'T12:00:00')) / DAY);
  const txt = diff === 0 ? 'hoje' : diff === 1 ? 'amanhã' : diff === -1 ? 'ontem' : d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  return `<span class="prazo${late ? ' late' : ''}">${late ? 'Atrasada · ' : ''}${txt}</span>`;
}
$('ovNew').onclick = () => { nav('projects'); $('nf').hidden = false; $('nn').focus(); };

/* ================= Projetos ================= */
let pk = 'Todos';
function renderProjects() {
  const q = $('q').value.toLowerCase();
  const L = S.projetos.filter(p => (pk === 'Todos' || { Jogos: 'Jogo', Apps: 'App', Sites: 'Site' }[pk] === p.tipo) && (p.nome + ' ' + p.tecnologia).toLowerCase().includes(q))
    .sort((a, b) => b.status - a.status || b.progresso - a.progresso);
  const cnt = (t, um, varios) => { const n = S.projetos.filter(p => p.tipo === t).length; return n + ' ' + (n === 1 ? um : varios); };
  $('psum').textContent = [cnt('Jogo', 'jogo', 'jogos'), cnt('App', 'app', 'apps'), cnt('Site', 'site', 'sites')].join(' · ') + ' · toque num projeto para ver tudo';
  $('importBox').hidden = !!S.projetos.length;
  $('projs').innerHTML = L.length ? L.map(p => {
    const u = users30(p.id), bugs = S.feedback.filter(f => f.projeto_id === p.id && !f.resolvido).length;
    return `<div class="c glass stat" data-open="${p.id}" role="button" tabindex="0" style="cursor:pointer;text-align:left"><div class="row">${icoBox(p)}<span class="pill"><span class="st" style="margin:0"><i style="background:${STC[p.status]}"></i>${STS[p.status]}</span></span></div>
    <b style="font-size:17px">${esc(p.nome)}</b><small style="display:block;color:var(--mut)">${TIPO_NOME(p.tipo)} · ${esc(p.tecnologia || '—')}</small>
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:12px"><span>Progresso</span><b>${p.progresso}%</b></div><div class="bar"><i style="width:${p.progresso}%"></i></div>
    <div style="display:flex;justify-content:space-between;gap:8px;margin-top:10px;font-size:13px;color:var(--mut)"><span>${u ? num(u) + ' usuários (30d)' : 'Sem dados ainda'}</span>${bugs ? `<span class="chip dn">${bugs} aberto${bugs > 1 ? 's' : ''}</span>` : ''}</div></div>`;
  }).join('') : (S.projetos.length ? '<p class="empty">Nenhum projeto encontrado.</p>' : '');
}
$('projs').onclick = e => { const c = e.target.closest('[data-open]'); if (c) openProject(c.dataset.open); };
$('projs').onkeydown = e => { if (e.key === 'Enter') { const c = e.target.closest('[data-open]'); if (c) openProject(c.dataset.open); } };
seg('pk', t => { pk = t; renderProjects(); });
$('newBtn').onclick = () => { $('nf').hidden = !$('nf').hidden; if (!$('nf').hidden) $('nn').focus(); };
$('nf').onsubmit = e => { e.preventDefault(); act(async () => { const np = await Store.add('projetos', { nome: $('nn').value.trim(), tipo: $('nk').value, tecnologia: $('ns').value.trim(), github: $('ng').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, ''), status: 0, progresso: 0 }); $('nf').reset(); $('nf').hidden = true; renderAll(); autoIcon(np); }, 'Projeto criado'); };
$('importBtn').onclick = () => act(async () => { await Store.addMany('projetos', window.MEUS_PROJETOS); renderAll(); }, 'Seus 12 projetos foram importados');
$('q').oninput = () => { if (view !== 'projects') nav('projects'); renderProjects(); };

/* ---------- Ícone original do projeto ---------- */
function probeImg(url) {
  return new Promise(res => { const i = new Image(); let done = false; const end = v => { if (!done) { done = true; res(v); } };
    i.referrerPolicy = 'no-referrer'; i.onload = () => end(i.naturalWidth >= 16 ? { url, w: i.naturalWidth } : null); i.onerror = () => end(null); setTimeout(() => end(null), 6000); i.src = url; });
}
async function iconFromSite(raw) {
  let base; try { base = new URL(/^https?:\/\//.test(raw) ? raw : 'https://' + raw); } catch (e) { return null; }
  const cands = [];
  try { // a página costuma deixar ler (GitHub Pages, Netlify, Vercel…)
    const html = await (await fetch(base.href, { mode: 'cors' })).text(), doc = new DOMParser().parseFromString(html, 'text/html');
    const man = doc.querySelector('link[rel="manifest"]');
    if (man) try { const mu = new URL(man.getAttribute('href'), base); const m = await (await fetch(mu.href)).json();
      (m.icons || []).forEach(ic => cands.push({ url: new URL(ic.src, mu).href, s: Math.max(...String(ic.sizes || '0').split(/\s+/).map(x => parseInt(x) || 0)) + 1000 })); } catch (e) {}
    doc.querySelectorAll('link[rel~="icon"],link[rel~="apple-touch-icon"],link[rel="shortcut icon"]').forEach(l => { const sz = parseInt(l.getAttribute('sizes')) || (/apple/.test(l.rel) ? 180 : 32); cands.push({ url: new URL(l.getAttribute('href'), base).href, s: sz + (/svg/.test(l.getAttribute('href')) ? 400 : 0) }); });
  } catch (e) {}
  cands.sort((a, b) => b.s - a.s);
  for (const c of cands.slice(0, 4)) { const ok = await probeImg(c.url); if (ok) return ok.url; }
  const dir = new URL('./', base).href, tries = ['icons/icon-512.png', 'icon-512.png', 'icons/icon-192.png', 'apple-touch-icon.png', 'favicon.png', 'favicon.ico'];
  for (const t of [...new Set([...tries.map(x => dir + x), ...tries.map(x => base.origin + '/' + x)])]) { const ok = await probeImg(t); if (ok && ok.w >= 32) return ok.url; }
  return null;
}
async function iconFromGithub(repo) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo || '')) return null;
  try {
    const r = await fetch('https://api.github.com/repos/' + repo + '/git/trees/HEAD?recursive=1'); if (!r.ok) return null;
    const T = (await r.json()).tree || [];
    const score = path => {
      const f = path.toLowerCase(), n = f.split('/').pop();
      if (!/\.(png|svg|webp|jpg|jpeg|ico)$/.test(n) || /(^|\/)(node_modules|\.git|test|tests|docs|screenshots?|vendor|build|dist)\//.test(f)) return 0;
      let s = 0;
      if (/^(app[-_]?)?icon[-_]?(512|1024)/.test(n) || /icon[-_]?512x512/.test(n)) s = 100;
      else if (/mipmap-xxxhdpi\/ic_launcher(_round)?\./.test(f)) s = 98;
      else if (/^(app[-_]?)?icon[-_]?(384|256|192)/.test(n) || /appicon/.test(f) && /1024/.test(n)) s = 92;
      else if (/^apple-touch-icon/.test(n)) s = 85;
      else if (/^(app[-_]?icon|icon|launcher[-_]?icon)\.(png|svg|webp)$/.test(n)) s = 80;
      else if (/^logo([-_]?(512|256|192))?\.(png|svg|webp)$/.test(n)) s = 70;
      else if (/^favicon\.(png|svg)$/.test(n)) s = 60;
      else if (/^ic_launcher\.(png|webp)$/.test(n)) s = 55;
      else if (/^favicon\.ico$/.test(n)) s = 40;
      return s ? s - path.split('/').length * .5 : 0;
    };
    const best = T.filter(x => x.type === 'blob').map(x => ({ p: x.path, s: score(x.path) })).filter(x => x.s).sort((a, b) => b.s - a.s)[0];
    if (!best) return null;
    const url = 'https://raw.githubusercontent.com/' + repo + '/HEAD/' + best.p.split('/').map(encodeURIComponent).join('/');
    return (await probeImg(url)) ? url : null;
  } catch (e) { return null; }
}
const ICON_TRY = 'painel_icone_tentativas';
async function autoIcon(p, force) {
  if (!p || (p.icone && !force)) return false;
  const tried = (() => { try { return JSON.parse(localStorage.getItem(ICON_TRY)) || {}; } catch (e) { return {}; } })(), key = p.id + '|' + p.url_app + '|' + p.github;
  if (!force && tried[key] > Date.now() - 7 * DAY) return false;
  tried[key] = Date.now(); try { localStorage.setItem(ICON_TRY, JSON.stringify(tried)); } catch (e) {}
  const url = (p.url_app && await iconFromSite(p.url_app)) || (p.github && await iconFromGithub(p.github));
  if (!url) return false;
  try { await Store.upd('projetos', p.id, { icone: url }); } catch (e) { if (force) throw e; return false; }
  renderAll(); return true;
}
async function autoIconsAll() { for (const p of S.projetos.filter(p => !p.icone && (p.url_app || p.github))) await autoIcon(p); }
function fileToIcon(file) {
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error('Escolha um arquivo de imagem.'));
    const u = URL.createObjectURL(file), i = new Image();
    i.onload = () => { const n = 192, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), r = Math.max(n / i.width, n / i.height), w = i.width * r, h = i.height * r; x.drawImage(i, (n - w) / 2, (n - h) / 2, w, h); URL.revokeObjectURL(u); let d = c.toDataURL('image/webp', .9); if (!/^data:image\/webp/.test(d)) d = c.toDataURL('image/png'); res(d); };
    i.onerror = () => { URL.revokeObjectURL(u); rej(new Error('Não deu para abrir essa imagem.')); }; i.src = u;
  });
}

/* ---------- Gaveta do projeto ---------- */
let openId = null, delArm = false;
function openProject(id) {
  const p = proj(id); if (!p) return; openId = id; delArm = false;
  const lim = Date.now() - 30 * DAY;
  const tk = S.tarefas.filter(t => t.projeto_id === id), vs = S.versoes.filter(v => v.projeto_id === id);
  const erros = S.eventos.filter(e => e.projeto_id === id && e.tipo === 'erro' && new Date(e.criado_em) > lim).length;
  $('dpanel').innerHTML = `
  <div style="display:flex;gap:12px;align-items:flex-start">${icoBox(p, 'margin:0;width:56px;height:56px')}<div class="grow" style="flex:1"><h2>${esc(p.nome)}</h2><small style="color:var(--mut)">${TIPO_NOME(p.tipo)} · ${esc(p.tecnologia || '—')}</small></div><button class="ib" data-x="close" aria-label="Fechar">✕</button></div>
  <div class="sec"><h3>Status</h3><div class="seg" id="dst">${STS.map((s, i) => `<button class="${p.status == i ? 'on' : ''}" data-s="${i}">${s}</button>`).join('')}</div>
   <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:14px"><span>Progresso</span><b id="dpv">${p.progresso}%</b></div>
   <input type="range" min="0" max="100" step="5" value="${p.progresso}" id="dpr" aria-label="Progresso" style="width:100%;accent-color:var(--acc);height:28px"></div>
  <div class="sec"><h3>Números</h3><div class="kv"><div><b>${num(users30(id))}</b><small>Usuários 30d</small></div><div><b>${num(evOf(id, 'instalar').length)}</b><small>Instalações</small></div><div><b>${erros}</b><small>Erros 30d</small></div><div><b>${S.feedback.filter(f => f.projeto_id === id && !f.resolvido).length}</b><small>Bugs abertos</small></div></div></div>
  <div class="sec"><h3>Informações</h3>
   <div class="iconrow">${icoBox(p, 'margin:0;width:64px;height:64px')}<div style="flex:1;min-width:0"><b style="display:block">Ícone do projeto</b><small style="color:var(--mut)">${p.icone ? 'Ícone original do projeto.' : 'Busco no link do app/site e no GitHub, ou você envia a imagem.'}</small>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="mini" data-x="icauto">Buscar automático</button><label class="mini" for="dicf" style="display:inline-flex;align-items:center;cursor:pointer">Enviar imagem</label><input type="file" id="dicf" accept="image/*" hidden>${p.icone ? '<button class="mini" data-x="icdel">Remover</button>' : ''}</div></div></div>
   <label class="lbl" for="dn">Nome</label><input class="inp" id="dn" value="${esc(p.nome)}" maxlength="80">
   <div class="row2"><div><label class="lbl" for="dk">Tipo</label><select class="inp" id="dk"><option ${p.tipo === 'App' ? 'selected' : ''}>App</option><option ${p.tipo === 'Jogo' ? 'selected' : ''}>Jogo</option><option value="Site" ${p.tipo === 'Site' ? 'selected' : ''}>Site / Web app</option></select></div><div><label class="lbl" for="dt">Tecnologia</label><input class="inp" id="dt" value="${esc(p.tecnologia)}" maxlength="120"></div></div>
   <label class="lbl" for="dg">Repositório no GitHub (usuario/repo)</label><input class="inp" id="dg" value="${esc(p.github)}" placeholder="carlosandre1514-prog/meu-app" maxlength="120">
   <label class="lbl" for="du">Link do app publicado</label><input class="inp" id="du" value="${esc(p.url_app)}" placeholder="https://..." maxlength="300">
   <label class="lbl" for="dno">Anotações</label><textarea class="inp" id="dno" maxlength="10000" placeholder="Ideias, senhas de teste (sem senhas reais!), comandos do Termux…">${esc(p.notas)}</textarea>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn pri" data-x="save">Salvar</button>${p.github ? `<a class="btn" href="https://github.com/${esc(p.github)}">Abrir no GitHub</a>` : ''}${/^https?:\/\//.test(p.url_app) ? `<a class="btn" href="${esc(p.url_app)}">Abrir o app</a>` : ''}</div></div>
  <div class="sec"><h3>Tarefas</h3>${tk.length ? tk.map(t => `<div class="li"><input type="checkbox" class="tg" data-tk="${t.id}" ${t.coluna == 2 ? 'checked' : ''} aria-label="Concluída"><div class="grow"><b style="${t.coluna == 2 ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(t.titulo)}</b><small>${COLS[t.coluna]} · ${PR[t.prioridade]}</small></div>${prazoTag(t)}</div>`).join('') : '<p class="empty" style="padding:6px 0">Sem tarefas.</p>'}
   <form id="dtf" class="row2" style="margin-top:10px"><input class="inp" id="dtt" placeholder="Nova tarefa" required maxlength="200" aria-label="Nova tarefa"><button class="btn pri" style="flex:0 0 auto">Adicionar</button></form></div>
  <div class="sec"><h3>Versões</h3>${vs.length ? vs.map(v => `<div class="li"><span class="pill">${esc(v.versao)}</span><div class="grow">${esc(v.texto)}</div><small>${ago(v.criado_em)}</small></div>`).join('') : '<p class="empty" style="padding:6px 0">Nenhuma versão publicada.</p>'}
   <form id="dvf" class="row2" style="margin-top:10px"><input class="inp" id="dvv" placeholder="v1.0.0" required maxlength="30" style="flex:0 1 120px" aria-label="Versão"><input class="inp" id="dvt" placeholder="O que mudou?" maxlength="2000" aria-label="O que mudou"><button class="btn pri" style="flex:0 0 auto">Publicar</button></form></div>
  <div class="sec"><h3>Últimos commits</h3><div id="dcm">${p.github ? '<p class="empty" style="padding:6px 0">Carregando…</p>' : '<p class="empty" style="padding:6px 0">Coloque o repositório do GitHub acima para ver os commits.</p>'}</div></div>
  <div class="sec"><h3>Ligar este app ao painel</h3><p style="color:var(--mut);margin:0 0 10px;font-size:14px">${S.chaves.some(c => c.projeto_id === id) ? 'Este app já está conectado. Veja jogadores, receita, servidor e tudo mais em Apps conectados.' : 'Gere uma chave de acesso para este app enviar jogadores, assinaturas, transações, partidas e o status do servidor.'}</p>
   <button class="btn pri" data-x="apps">${S.chaves.some(c => c.projeto_id === id) ? 'Abrir dados do app' : 'Conectar este app'}</button></div>
  <div class="sec"><button class="btn" data-x="del" id="ddel" style="border-color:rgba(251,113,133,.5)">Excluir projeto</button></div>`;
  $('drawer').hidden = false; document.body.style.overflow = 'hidden';
  $('dpr').oninput = e => { $('dpv').textContent = e.target.value + '%'; };
  $('dpr').onchange = e => act(async () => { await Store.upd('projetos', id, { progresso: +e.target.value }); renderAll(); });
  $('dtf').onsubmit = e => { e.preventDefault(); act(async () => { await Store.add('tarefas', { projeto_id: id, titulo: $('dtt').value.trim(), prioridade: 'm', coluna: 0 }); renderAll(); openProject(id); }, 'Tarefa adicionada'); };
  $('dvf').onsubmit = e => { e.preventDefault(); act(async () => { await Store.add('versoes', { projeto_id: id, versao: $('dvv').value.trim(), texto: $('dvt').value.trim() }); renderAll(); openProject(id); }, 'Versão publicada'); };
  if (p.github) loadCommits(p.github);
  setTimeout(() => $('dpanel').querySelector('[data-x=close]').focus(), 50);
}
async function loadCommits(repo) {
  const box = $('dcm');
  try {
    const r = await fetch('https://api.github.com/repos/' + repo + '/commits?per_page=6');
    if (!r.ok) throw new Error(r.status === 404 ? 'Repositório não encontrado (ou é privado).' : r.status === 403 ? 'Limite do GitHub atingido. Tente daqui a pouco.' : 'Erro ' + r.status);
    const L = await r.json(); if (!box.isConnected) return;
    box.innerHTML = L.length ? L.map(c => `<div class="li"><div class="ico" style="margin:0;width:32px;height:32px">${svg('code')}</div><div class="grow"><a href="${esc(c.html_url)}" style="color:inherit"><b>${esc(c.commit.message.split('\n')[0])}</b></a><small>${esc(c.commit.author?.name || '')} · ${ago(c.commit.author?.date)}</small></div></div>`).join('') : '<p class="empty">Sem commits.</p>';
  } catch (e) { if (box.isConnected) box.innerHTML = `<p class="empty" style="padding:6px 0">${esc(e.message === 'Failed to fetch' ? 'Não deu para falar com o GitHub daqui. Na versão publicada no GitHub Pages funciona.' : e.message)}</p>`; }
}
function closeDrawer() { $('drawer').hidden = true; document.body.style.overflow = ''; openId = null; }
$('drawer').onclick = e => { if (e.target === $('drawer')) closeDrawer(); };
$('dpanel').onclick = e => {
  const b = e.target.closest('[data-x],[data-s]'); if (!b) return; const id = openId;
  if (b.dataset.s != null) return act(async () => { const s = +b.dataset.s; await Store.upd('projetos', id, s === 2 ? { status: 2, progresso: 100 } : { status: s }); renderAll(); openProject(id); }, +b.dataset.s === 2 ? 'Projeto lançado! 🚀' : 'Status atualizado');
  const x = b.dataset.x;
  if (x === 'close') closeDrawer();
  if (x === 'icauto') { b.disabled = true; b.textContent = 'Procurando…'; act(async () => { const ok = await autoIcon(proj(id), true); if (openId === id) openProject(id); toast(ok ? 'Ícone encontrado' : 'Não achei um ícone. Coloque o link do app/site ou o repositório do GitHub, ou envie a imagem.'); }); }
  if (x === 'icdel') act(async () => { await Store.upd('projetos', id, { icone: '' }); renderAll(); openProject(id); }, 'Ícone removido');
  if (x === 'save') act(async () => { await Store.upd('projetos', id, { nome: $('dn').value.trim() || 'Sem nome', tipo: $('dk').value, tecnologia: $('dt').value.trim(), github: $('dg').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, ''), url_app: $('du').value.trim(), notas: $('dno').value }); renderAll(); openProject(id); autoIcon(proj(id)); }, 'Projeto salvo');
  if (x === 'apps') { const ok = S.chaves.some(c => c.projeto_id === id); closeDrawer(); nav('apps'); if (ok) { appSel = id; openApps(id); } else showConnect(id); }
  if (x === 'del') { if (!delArm) { delArm = true; b.textContent = 'Toque de novo para excluir tudo deste projeto'; return; } act(async () => { await Store.del('projetos', id); closeDrawer(); renderAll(); }, 'Projeto excluído'); }
};
$('dpanel').onchange = e => { if (e.target.id === 'dicf') { const f = e.target.files[0], id = openId; if (f) act(async () => { await Store.upd('projetos', id, { icone: await fileToIcon(f) }); renderAll(); openProject(id); }, 'Ícone salvo'); return; } const t = e.target.dataset.tk; if (t) act(async () => { await Store.upd('tarefas', t, { coluna: e.target.checked ? 2 : 0 }); renderAll(); openProject(openId); }); };
async function copy(text, ok) { try { await navigator.clipboard.writeText(text); toast(ok); } catch (e) { toast('Não deu para copiar. Segure no texto e copie à mão.'); } }

/* ================= Apps conectados ================= */
let appSel = '', appD = null, appTab = 'Jogadores', appInt = 'Prompt para IA', chaveNova = null, keyDel = null, acMode = 'Gerar chave';
const isOn = j => !!j.online_ate && new Date(j.online_ate) > Date.now();
const srvOn = s => !!(s && s.ativo && s.ultimo_sinal && Date.now() - new Date(s.ultimo_sinal) < 3 * 60e3);
const dur = sec => { sec = Math.max(0, Math.floor(sec)); const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60); return d ? d + 'd ' + h + 'h' : h ? h + 'h ' + String(m).padStart(2, '0') + 'min' : m + ' min'; };
const METODO = { google: 'Google', email: 'E-mail', apple: 'Apple', facebook: 'Facebook', anonimo: 'Convidado', telefone: 'Telefone', discord: 'Discord' };
const PLANO = { mensal: 'Mensal', anual: 'Anual', semanal: 'Semanal', vitalicio: 'Vitalício' };
const cap = t => t ? t[0].toUpperCase() + t.slice(1) : '';
const planoAtivo = j => !!j.plano && !!j.plano_expira && new Date(j.plano_expira) > Date.now();
const mrrOf = j => j.plano_status === 'cancelada' ? 0 : j.plano === 'anual' ? j.plano_valor / 12 : j.plano === 'semanal' ? j.plano_valor * 52 / 12 : j.plano === 'vitalicio' ? 0 : +j.plano_valor;
const evValor = e => { const v = +e.dados?.valor || 0; if (e.tipo === 'transacao') return e.dados?.tipo === 'reembolso' ? -v : v; if (e.tipo === 'assinatura') { const s = e.dados?.status || 'ativa'; return s === 'reembolsada' ? -v : ['ativa', 'renovada', 'nova'].includes(s) ? v : 0; } return 0; };
const dkey = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
const days30 = () => { const a = []; for (let i = 29; i >= 0; i--) a.push(dkey(Date.now() - i * DAY)); return a; };
const dt = t => new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const connectedApps = () => { const ids = new Set(S.chaves.map(c => c.projeto_id)); return S.projetos.filter(p => ids.has(p.id)); };

async function loadApp(full) {
  const pid = appSel; if (!pid) { appD = null; return renderApps(); }
  try {
    if (full || !appD || appD.pid !== pid || appD.erro) appD = { ...(await Store.appData(pid)), pid };
    else Object.assign(appD, await Store.appLive(pid));
  } catch (e) { if (appSel === pid) appD = { pid, erro: e.message || String(e) }; }
  if (appSel === pid) { renderApps(); drawAll(); }
}
function openApps(pid) {
  if (pid) appSel = pid;
  const L = connectedApps(); if (!L.some(p => p.id === appSel)) appSel = L[0]?.id || '';
  renderApps(); if (appSel && (!appD || appD.pid !== appSel)) loadApp(true);
}
setInterval(() => { if (view === 'apps' && appSel && !document.hidden && !$('shell').hidden) loadApp(false); }, 20000);

function renderApps() {
  const L = connectedApps();
  $('aproj').innerHTML = L.map(p => `<option value="${p.id}" ${p.id === appSel ? 'selected' : ''}>${esc(p.nome)}</option>`).join('') || '<option value="">Nenhum app conectado</option>';
  $('aproj').disabled = !L.length;
  $('acp').innerHTML = S.projetos.map(p => `<option value="${p.id}" ${p.id === (appSel || '') ? 'selected' : ''}>${esc(p.nome)} · ${p.tipo}</option>`).join('') || '<option value="">Crie um projeto primeiro</option>';
  const err = S.chavesErro ? 'A área de apps conectados ainda não foi ativada no Supabase. Rode o arquivo supabase/apps_conectados.sql no SQL Editor (detalhe: ' + S.chavesErro + ')' : appD?.erro ? 'Não deu para carregar os dados do app: ' + appD.erro : '';
  $('aerr').hidden = !err; $('aerr').textContent = err;
  $('aempty').hidden = !!L.length || !$('acf').hidden || !!S.chavesErro;
  $('abody').hidden = !appSel;
  renderReveal();
  if (!appSel) return;
  renderAppKeys(); renderAppCode();
  const D = appD && appD.pid === appSel && !appD.erro ? appD : null;
  if (!D) { $('asrv').innerHTML = '<p class="empty" style="padding:6px 0;margin:0">Carregando dados do app…</p>'; ['aplayers', 'amoney', 'agame'].forEach(i => $(i).innerHTML = ''); $('atbody').innerHTML = ''; return; }
  const p = proj(appSel), J = D.jogadores, E = D.eventos, s = D.servidor, now = Date.now(), lim = now - 30 * DAY, lim2 = now - 60 * DAY;
  const in30 = e => new Date(e.criado_em) > lim, in60 = e => new Date(e.criado_em) > lim2 && !in30(e);
  const sOn = srvOn(s), onJ = J.filter(isOn).length, online = sOn ? Math.max(s.online, onJ) : onJ, total = J.length;
  const novos30 = J.filter(j => new Date(j.primeiro_em) > lim).length, novos60 = J.filter(j => { const t = new Date(j.primeiro_em); return t > lim2 && t <= lim; }).length;
  const ativos7 = J.filter(j => new Date(j.visto_em) > now - 7 * DAY).length;
  const up = D.uptime || [], up30 = up.filter(u => u.dia >= dkey(lim)).reduce((a, u) => a + u.segundos, 0);
  // Servidor
  const ult = s?.ultimo_sinal;
  $('asrv').innerHTML = `<div class="st-main">${p ? icoBox(p, 'margin:0;width:46px;height:46px') : ''}<span class="pulse ${s ? (sOn ? 'on' : 'off') : ''}"></span><div><b>${s ? (sOn ? 'Servidor online' : 'Servidor offline') : 'Nenhum servidor enviando sinal'}</b><small>${s ? (sOn ? 'Ativo há ' + dur((now - new Date(s.ativo_desde)) / 1000) + (s.versao ? ' · versão ' + esc(s.versao) : '') : 'Último sinal ' + (ult ? ago(ult) : '—')) : 'Use o código do servidor (abaixo) para ver online, horas ativas e status.'}</small></div></div>
   <div class="kvs"><div><b>${num(online)}</b><small>Online agora</small></div><div><b>${(up30 / 3600).toFixed(1).replace('.', ',')} h</b><small>Ativo em 30 dias</small></div><div><b>${up.length ? (up30 / (30 * 864) ).toFixed(1).replace('.', ',') + '%' : '—'}</b><small>Disponibilidade</small></div><div><b>${num(Math.max(0, ...up.map(u => u.pico_online)))}</b><small>Pico online (30d)</small></div><div><b>${ult ? ago(ult) : '—'}</b><small>Último sinal</small></div></div>`;
  // Jogadores
  $('aplayers').innerHTML = [['team', num(total), (p?.tipo === 'Jogo' ? 'Jogadores' : p?.tipo === 'Site' ? 'Visitantes' : 'Usuários') + ' no total'], ['user', num(online) + `<small>${total ? Math.round(online / total * 100) : 0}%</small>`, 'Online agora'], ['clock', num(Math.max(0, total - online)), 'Offline'], ['up', num(novos30), 'Novos (30 dias)', trend(novos30, novos60)]].map(stat).join('');
  // Dinheiro
  const rec30 = E.filter(in30).reduce((a, e) => a + evValor(e), 0), rec60 = E.filter(in60).reduce((a, e) => a + evValor(e), 0);
  const subs = J.filter(planoAtivo), mrr = subs.reduce((a, j) => a + mrrOf(j), 0), compras = E.filter(e => e.tipo === 'transacao' && in30(e) && e.dados?.tipo !== 'reembolso');
  const pagantes = J.filter(j => +j.gasto > 0).length;
  $('amoney').innerHTML = [['money', fmt(rec30), 'Receita (30 dias)', trend(rec30, rec60)], ['star', fmt(mrr), 'Receita recorrente por mês'], ['team', num(subs.length), 'Assinantes ativos'], ['code', compras.length ? fmt(compras.reduce((a, e) => a + (+e.dados?.valor || 0), 0) / compras.length) : '—', 'Ticket médio por compra']].map(stat).join('');
  $('arevTot').textContent = 'Últimos 30 dias · ' + fmt(rec30) + ' · ' + num(pagantes) + ' pagantes no total';
  // Cadastro por método e planos
  const MT = {}; J.forEach(j => { const m = j.metodo || 'não informado'; MT[m] = (MT[m] || 0) + 1; });
  const ML = Object.entries(MT).sort((a, b) => b[1] - a[1]).slice(0, 6), mm = ML[0]?.[1] || 1;
  $('ametodo').innerHTML = ML.length ? ML.map(([m, v]) => `<div><span>${esc(METODO[m] || cap(m))}</span><span class="bar"><i style="width:${v / mm * 100}%"></i></span><b class="r">${num(v)}</b></div>`).join('') : '<p class="empty" style="padding:6px 0">Sem cadastros ainda.</p>';
  const PL = {}; subs.forEach(j => PL[j.plano] = (PL[j.plano] || 0) + 1);
  const PLL = Object.entries(PL).sort((a, b) => b[1] - a[1]), pm = PLL[0]?.[1] || 1;
  $('aplanTot').textContent = subs.filter(j => j.plano_status === 'cancelada').length + ' cancelados que ainda valem até vencer';
  $('aplanos').innerHTML = PLL.length ? PLL.map(([k, v]) => `<div><span>${esc(PLANO[k] || cap(k))}</span><span class="bar"><i style="width:${v / pm * 100}%"></i></span><b class="r">${num(v)}</b></div>`).join('') : '<p class="empty" style="padding:6px 0">Nenhuma assinatura ativa.</p>';
  // Jogo
  const part = E.filter(e => e.tipo === 'partida' && in30(e)), pres = E.filter(e => e.tipo === 'presente' && in30(e));
  $('agame').innerHTML = [['game', num(part.length), 'Partidas (30 dias)'], ['clock', part.length ? Math.round(part.reduce((a, e) => a + (+e.dados?.minutos || 0), 0) / part.length) + ' min' : '—', 'Duração média da partida'], ['gift', num(pres.length), 'Presentes enviados (30 dias)'], ['team', num(ativos7), 'Ativos nos últimos 7 dias']].map(stat).join('');
  $('anewTot').textContent = 'Por dia · ' + num(novos30) + ' em 30 dias';
  $('aupTot').textContent = 'Horas por dia · ' + (up30 / 3600).toFixed(0) + ' h em 30 dias';
  renderAppTable();
}

function appRows() {
  const D = appD, J = D.jogadores, byU = {}; J.forEach(j => byU[j.usuario] = j);
  const who = e => e.dados?.nome || byU[e.usuario]?.nome || shortUser(e.usuario);
  const evs = t => D.eventos.filter(e => e.tipo === t);
  const pill = (t, cls) => `<span class="tag ${cls || ''}">${esc(t)}</span>`;
  const W = n => `<span class="who"><span class="av">${esc(ini(n))}</span>${esc(n)}</span>`;
  if (appTab === 'Jogadores') return { h: ['Jogador', 'Status', 'Cadastro', 'Plano', 'Gasto', 'Partidas', 'Desde'], r: [...J].sort((a, b) => isOn(b) - isOn(a) || String(b.visto_em).localeCompare(String(a.visto_em))).map(j => { const n = j.nome || shortUser(j.usuario), on = isOn(j); return { q: n + ' ' + j.usuario + ' ' + j.plataforma, csv: [n, j.usuario, on ? 'online' : 'offline', j.visto_em, j.metodo, j.plano, j.plano_status, j.plano_expira || '', j.gasto, j.partidas, j.primeiro_em], html: [W(n), `<span class="dotj${on ? ' on' : ''}"></span>${on ? 'Online' : 'Visto ' + ago(j.visto_em)}`, esc(METODO[j.metodo] || cap(j.metodo) || '—') + (j.plataforma ? ' · ' + esc(j.plataforma) : ''), j.plano ? pill((PLANO[j.plano] || cap(j.plano)) + (planoAtivo(j) ? (j.plano_status === 'cancelada' ? ' · cancelado' : '') : ' · vencido'), planoAtivo(j) && j.plano_status !== 'cancelada' ? 'up' : 'dn') : '—', `<span class="num">${fmt(j.gasto)}</span>`, num(j.partidas), new Date(j.primeiro_em).toLocaleDateString('pt-BR')] }; }), right: [4, 5] };
  if (appTab === 'Assinaturas') return { h: ['Data', 'Jogador', 'Plano', 'Status', 'Valor'], r: evs('assinatura').map(e => { const n = who(e), st = e.dados?.status || 'ativa'; return { q: n + ' ' + (e.dados?.plano || ''), csv: [e.criado_em, n, e.usuario, e.dados?.plano, st, e.dados?.valor], html: [dt(e.criado_em), W(n), esc(PLANO[e.dados?.plano] || cap(e.dados?.plano) || '—'), pill(cap(st), ['ativa', 'renovada', 'nova'].includes(st) ? 'up' : 'dn'), fmt(e.dados?.valor)] }; }), right: [4] };
  if (appTab === 'Transações') return { h: ['Data', 'Jogador', 'Item', 'Tipo', 'Valor'], r: evs('transacao').map(e => { const n = who(e), rb = e.dados?.tipo === 'reembolso'; return { q: n + ' ' + (e.dados?.item || ''), csv: [e.criado_em, n, e.usuario, e.dados?.item, rb ? 'reembolso' : 'compra', e.dados?.valor], html: [dt(e.criado_em), W(n), esc(e.dados?.item || '—'), pill(rb ? 'Reembolso' : 'Compra', rb ? 'dn' : 'up'), `<b class="num">${rb ? '−' : ''}${fmt(e.dados?.valor)}</b>`] }; }), right: [4] };
  if (appTab === 'Presentes') return { h: ['Data', 'De', 'Para', 'Presente', 'Valor'], r: evs('presente').map(e => { const n = who(e); return { q: n + ' ' + (e.dados?.para || '') + ' ' + (e.dados?.item || ''), csv: [e.criado_em, n, e.dados?.para, e.dados?.item, e.dados?.valor], html: [dt(e.criado_em), W(n), esc(e.dados?.para || '—'), esc(e.dados?.item || '—'), num(e.dados?.valor)] }; }), right: [4] };
  if (appTab === 'Partidas') return { h: ['Data', 'Jogador', 'Modo', 'Abates', 'Resultado', 'Duração'], r: evs('partida').map(e => { const n = who(e), w = !!e.dados?.vitoria; return { q: n + ' ' + (e.dados?.modo || ''), csv: [e.criado_em, n, e.dados?.modo, e.dados?.abates, w ? 'vitória' : 'derrota', e.dados?.minutos], html: [dt(e.criado_em), W(n), esc(e.dados?.modo || '—'), num(e.dados?.abates), pill(w ? 'Vitória' : 'Derrota', w ? 'up' : 'dn'), (+e.dados?.minutos || 0) + ' min'] }; }), right: [3, 5] };
  return { h: ['Data', 'Tipo', 'Jogador', 'Plataforma', 'Dados'], r: D.eventos.map(e => { const n = e.usuario ? who(e) : '—', { nome, ...rest } = e.dados || {}, js = JSON.stringify(rest); return { q: e.tipo + ' ' + n + ' ' + js, csv: [e.criado_em, e.tipo, n, e.usuario, e.plataforma, js], html: [dt(e.criado_em), pill(e.tipo), esc(n), esc(e.plataforma || '—'), `<code style="font-size:12px;word-break:break-all">${esc(js === '{}' ? '' : js.slice(0, 160))}</code>`] }; }), right: [] };
}
function renderAppTable() {
  if (!appD || appD.erro) return;
  const T = appRows(), q = $('aq').value.trim().toLowerCase(), R = q ? T.r.filter(x => x.q.toLowerCase().includes(q)) : T.r;
  $('athead').innerHTML = '<tr>' + T.h.map((h, i) => `<th${T.right.includes(i) || /Valor|Gasto/.test(h) ? ' class="r"' : ''}>${h}</th>`).join('') + '</tr>';
  $('atbody').innerHTML = R.length ? R.slice(0, 300).map(x => '<tr>' + x.html.map((c, i) => `<td${T.right.includes(i) || /Valor|Gasto/.test(T.h[i]) ? ' class="r"' : ''}>${c}</td>`).join('') + '</tr>').join('') : `<tr><td colspan="${T.h.length}" class="empty">Nada aqui ainda.</td></tr>`;
  $('atabSum').textContent = num(R.length) + (R.length === 1 ? ' registro' : ' registros') + (R.length > 300 ? ' · mostrando 300 (use a busca ou o CSV)' : '') + (appTab !== 'Jogadores' ? ' · últimos 90 dias' : '');
}
seg('atab', t => { appTab = t; $('aq').value = ''; renderAppTable(); });
$('aq').oninput = renderAppTable;
$('acsv').onclick = () => { if (!appD || appD.erro) return; const T = appRows(), q = $('aq').value.trim().toLowerCase(), R = q ? T.r.filter(x => x.q.toLowerCase().includes(q)) : T.r; download((pname(appSel) + '-' + appTab).toLowerCase().replace(/[^a-z0-9]+/gi, '-') + '.csv', R.map(x => x.csv.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(';')).join('\n'), 'text/csv'); };
$('aproj').onchange = () => { appSel = $('aproj').value; appD = null; renderApps(); loadApp(true); };

function drawApp() {
  if (!appD || appD.erro || appD.pid !== appSel) return;
  const K = days30(), lab = K.map(k => String(+k.slice(8))), R = {}, N = {}, U = {};
  appD.eventos.forEach(e => { const v = evValor(e); if (v) { const k = dkey(e.criado_em); R[k] = (R[k] || 0) + v; } });
  appD.jogadores.forEach(j => { const k = dkey(j.primeiro_em); N[k] = (N[k] || 0) + 1; });
  (appD.uptime || []).forEach(u => U[u.dia] = u.segundos / 3600);
  barChart($('arevc'), K.map(k => Math.max(0, R[k] || 0)), lab, 1);
  barChart($('aupc'), K.map(k => +(U[k] || 0).toFixed(1)), lab);
  barChart($('anewc'), K.map(k => N[k] || 0), lab);
}

/* Chaves */
function renderAppKeys() {
  const L = S.chaves.filter(c => c.projeto_id === appSel);
  $('akeys').innerHTML = L.length ? L.map(c => `<div class="keyrow"><div class="ico" style="margin:0;width:34px;height:34px">${svg('key')}</div><div class="grow"><b>${esc(c.nome)}</b> ${c.ativa ? '<span class="tag up">Ativa</span>' : '<span class="tag dn">Desativada</span>'}<small><code>${esc(c.prefixo)}••••••••</code> · ${c.ultimo_uso ? 'usada ' + ago(c.ultimo_uso) + ' · ' + num(c.usos) + ' envios' : 'nunca usada'}</small></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="mini" data-kt="${c.id}">${c.ativa ? 'Desativar' : 'Ativar'}</button><button class="mini" data-kd="${c.id}">${keyDel === c.id ? 'Toque de novo para apagar' : 'Apagar'}</button></div></div>`).join('') : '<p class="empty" style="padding:6px 0">Nenhuma chave.</p>';
}
$('akeys').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.kt) act(async () => { const c = S.chaves.find(x => x.id === b.dataset.kt); await Store.updChave(c.id, { ativa: !c.ativa }); renderAppKeys(); }, 'Chave atualizada');
  if (b.dataset.kd) { if (keyDel !== b.dataset.kd) { keyDel = b.dataset.kd; return renderAppKeys(); } keyDel = null; act(async () => { await Store.delChave(b.dataset.kd); openApps(); }, 'Chave apagada. Apps usando ela param de enviar dados.'); }
};
function showConnect(pid) {
  $('acf').hidden = false; chaveNova = null; renderApps(); if (pid) $('acp').value = pid;
  $('acn').value = ''; $('ack').value = ''; $('acf').scrollIntoView({ behavior: 'smooth', block: 'start' }); $('acn').focus();
}
$('aNew').onclick = () => showConnect();
$('aFirst').onclick = () => showConnect();
$('aKeyNew').onclick = () => showConnect(appSel);
$('acx').onclick = () => { $('acf').hidden = true; renderApps(); };
seg('acm', t => { acMode = t; $('ack').hidden = t === 'Gerar chave'; $('ack').required = t !== 'Gerar chave'; if (t !== 'Gerar chave') $('ack').focus(); });
$('acf').onsubmit = e => {
  e.preventDefault(); const pid = $('acp').value; if (!pid) return toast('Crie um projeto primeiro');
  act(async () => {
    const gerar = acMode === 'Gerar chave', chave = gerar ? Store.novaChave() : $('ack').value.trim();
    await Store.addChave(pid, $('acn').value.trim(), chave);
    chaveNova = { pid, chave, gerada: gerar }; $('acf').hidden = true; appSel = pid; appD = null;
    renderApps(); loadApp(true); $('arev').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 'App conectado');
};
function renderReveal() {
  const k = chaveNova && chaveNova.pid === appSel ? chaveNova : null; $('arev').hidden = !k; if (!k) return;
  $('arev').innerHTML = `<h3 style="margin:0;font-size:16px">${svg('key').replace('<svg', '<svg width="18" height="18" style="vertical-align:-3px;margin-right:6px"')}Chave de ${esc(pname(k.pid))}</h3>
   <div class="keybox"><code>${esc(k.chave)}</code><button class="btn pri" id="arevCopy">Copiar chave</button></div>
   <small style="color:var(--mut)">${k.gerada ? '<b style="color:var(--warn)">Guarde agora:</b> por segurança o painel só guarda uma impressão digital da chave, e ela não aparece de novo. ' : ''}O código abaixo, em "Como ligar o app", já está com essa chave.</small>
   <div style="margin-top:10px"><button class="mini" id="arevOk">Já guardei</button></div>`;
  $('arevCopy').onclick = () => copy(k.chave, 'Chave copiada');
  $('arevOk').onclick = () => { $('arev').hidden = true; chaveNova = { ...k, oculta: true }; };
}

/* Código de integração */
const TIPOS = [['instalar / abrir', 'Automático no código do site: primeira vez e cada abertura'], ['ping / saiu', 'Automático: mantém o jogador como online e marca quando sai'], ['cadastro', '{ metodo: "google" | "email" | "apple" | "anonimo" }'], ['login', '{ metodo }'], ['assinatura', '{ plano: "mensal" | "anual" | "semanal", valor, status: "ativa" | "renovada" | "cancelada" | "expirada" | "reembolsada", expira_em? }'], ['transacao', '{ valor, item, tipo?: "compra" | "reembolso" }'], ['presente', '{ para, item, valor? }'], ['partida', '{ abates, vitoria, minutos, modo? }'], ['entrou', 'Jogador entrou no servidor (marca online)'], ['servidor', '{ online, versao? } a cada 1 minuto: status, horas ativas e jogadores online'], ['servidor_parou', 'Servidor desligando'], ['erro', '{ mensagem }'], ['feedback', '{ tipo: "bug" | "sugestao", mensagem, contato? }'], ['qualquer outro', 'Nome em minúsculas, com os dados que quiser: aparece na aba Eventos']];
$('atipos').innerHTML = '<dl>' + TIPOS.map(([t, d]) => `<dt><code>${esc(t)}</code></dt><dd>${esc(d)}</dd>`).join('') + '</dl><p style="color:var(--mut);margin:10px 0 0">Todo evento pode ter <code>usuario</code> (id do jogador) e <code>nome</code>. Valores em reais.</p>';
seg('aint', t => { appInt = t; renderAppCode(); });
const keyFor = pid => chaveNova && chaveNova.pid === pid ? chaveNova.chave : 'COLE_SUA_CHAVE_AQUI';
function codeFor(pid, tipo) {
  const c = window.PAINEL_CONFIG, url = c.supabaseUrl + '/rest/v1/rpc/painel_enviar', K = keyFor(pid), nome = pname(pid);
  if (tipo === 'Prompt para IA') return promptIA(url, c.supabaseKey, K, nome, proj(pid)?.tipo);
  if (tipo === 'Servidor Node') return `// Painel de Projetos · servidor do ${nome} (Node 18+)
// Guarde a chave numa variável de ambiente: PAINEL_CHAVE=${K}
const PAINEL_URL = '${url}';
const PAINEL_API = '${c.supabaseKey}';
const PAINEL_CHAVE = process.env.PAINEL_CHAVE;

function painel(eventos) {
  return fetch(PAINEL_URL, {
    method: 'POST',
    headers: { apikey: PAINEL_API, 'Content-Type': 'application/json' },
    body: JSON.stringify({ chave: PAINEL_CHAVE, eventos: [].concat(eventos) })
  }).catch(() => {});
}

// 1) Sinal de vida a cada minuto: servidor online, horas ativas e jogadores online
const sinal = () => painel({ tipo: 'servidor', dados: { online: jogadoresOnline(), versao: '1.0.0' } });
sinal(); setInterval(sinal, 60_000);
process.on('SIGTERM', async () => { await painel({ tipo: 'servidor_parou' }); process.exit(0); });

// 2) Quando acontecer algo no jogo (troque pelos dados reais):
painel({ tipo: 'cadastro', usuario: 'uid123', nome: 'Sniper_BR', dados: { metodo: 'google' } });
painel({ tipo: 'entrou', usuario: 'uid123' });          // ficou online
painel({ tipo: 'saiu', usuario: 'uid123' });            // ficou offline
painel({ tipo: 'assinatura', usuario: 'uid123', dados: { plano: 'mensal', valor: 19.9, status: 'ativa' } });
painel({ tipo: 'transacao', usuario: 'uid123', dados: { valor: 4.9, item: '500 moedas' } });
painel({ tipo: 'presente', usuario: 'uid123', dados: { para: 'LiaGamer', item: 'Rosa', valor: 1 } });
painel({ tipo: 'partida', usuario: 'uid123', dados: { abates: 12, vitoria: true, minutos: 8, modo: 'Squad' } });`;
  if (tipo === 'Outras (HTTP)') return `# Funciona em qualquer linguagem (Unity, Flutter, Android, Python, Godot…)
# Envie até 200 eventos por vez.

POST ${url}
apikey: ${c.supabaseKey}
Content-Type: application/json

{
  "chave": "${K}",
  "eventos": [
    { "tipo": "cadastro", "usuario": "uid123", "nome": "Sniper_BR", "plataforma": "Android", "dados": { "metodo": "google" } },
    { "tipo": "transacao", "usuario": "uid123", "dados": { "valor": 4.9, "item": "500 moedas" } },
    { "tipo": "servidor", "dados": { "online": 128 } }
  ]
}

# Resposta: { "ok": true, "recebidos": 3 }
# Chave errada ou desativada: erro 401.`;
  return `<script>
/* Painel de Projetos · cole antes de </body> no ${nome} */
window.painel = (function () {
  var URL = '${url}';
  var API = '${c.supabaseKey}';
  var CHAVE = '${K}';
  var ls = window.localStorage, fila = [], timer = null;
  var id = ls.getItem('painel_uid'), nome = ls.getItem('painel_nome') || '';
  if (!id) { id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(); ls.setItem('painel_uid', id); }
  var ua = navigator.userAgent, plat = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : 'Web';
  function enviar(fechando) {
    clearTimeout(timer); timer = null;
    while (fila.length) {
      var lote = fila.splice(0, 100);
      fetch(URL, { method: 'POST', keepalive: !!fechando, headers: { apikey: API, 'Content-Type': 'application/json' }, body: JSON.stringify({ chave: CHAVE, eventos: lote }) }).catch(function () {});
    }
  }
  function evento(tipo, dados) {
    fila.push({ tipo: tipo, usuario: id, nome: nome, plataforma: plat, dados: dados || {} });
    if (!timer) timer = setTimeout(enviar, 1500);
  }
  if (!ls.getItem('painel_inst')) { ls.setItem('painel_inst', '1'); evento('instalar'); }
  var ic = document.querySelector('link[rel~="apple-touch-icon"]') || document.querySelector('link[rel~="icon"]');
  evento('abrir', ic && /^https:/.test(ic.href) ? { icone: ic.href } : {}); // o painel usa o ícone do app
  setInterval(function () { if (!document.hidden) evento('ping'); }, 60000);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { evento('saiu'); enviar(true); } else evento('ping'); });
  window.addEventListener('error', function (e) { evento('erro', { mensagem: String(e.message).slice(0, 300) }); });
  return {
    // Depois do login: painel.identificar(user.uid, user.displayName)
    identificar: function (novoId, novoNome) { if (novoId) { id = String(novoId); ls.setItem('painel_uid', id); } if (novoNome) { nome = String(novoNome); ls.setItem('painel_nome', nome); } evento('ping'); },
    cadastro: function (metodo) { evento('cadastro', { metodo: metodo || 'email' }); },          // 'google', 'email'...
    login: function (metodo) { evento('login', { metodo: metodo || 'email' }); },
    assinatura: function (plano, valor, status) { evento('assinatura', { plano: plano, valor: valor, status: status || 'ativa' }); }, // 'mensal' | 'anual'
    transacao: function (valor, item) { evento('transacao', { valor: valor, item: item }); },
    presente: function (para, item, valor) { evento('presente', { para: para, item: item, valor: valor || 0 }); },
    partida: function (abates, venceu, minutos, modo) { evento('partida', { abates: abates, vitoria: !!venceu, minutos: minutos, modo: modo || '' }); },
    feedback: function (tipo, mensagem, contato) { evento('feedback', { tipo: tipo, mensagem: mensagem, contato: contato || '' }); },
    evento: evento
  };
})();
<\/script>`;
}
function promptIA(url, api, chave, nome, tipo) {
  return `Quero ligar este projeto (${nome}${tipo ? ', ' + tipo.toLowerCase() : ''}) ao meu painel de métricas. Faça a integração completa no código, seguindo as regras abaixo.

## Como enviar os dados
Faça POST para:
${url}

Cabeçalhos:
apikey: ${api}
Content-Type: application/json

Corpo (JSON):
{ "chave": "${chave}", "eventos": [ { "tipo": "...", "usuario": "id do usuário", "nome": "nome de exibição", "plataforma": "Android | iOS | Web | PC", "dados": { ... } } ] }

- Resposta de sucesso: {"ok": true, "recebidos": N}. Chave errada ou desativada: erro 401.
- Máximo de 200 eventos por envio. Agrupe eventos em lotes (a cada 1 a 2 segundos) em vez de um envio por evento.
- O envio nunca pode travar nem quebrar o app: faça de forma assíncrona, ignore erros de rede e não mostre nada ao usuário.
- Valores em reais (número, ex.: 19.9).
- "usuario" deve ser o id fixo do usuário (ex.: uid do Firebase/Supabase/Google). Antes do login, use um id anônimo salvo no aparelho e troque pelo id real depois do login.

## Eventos que o painel entende (tipo → dados)
- instalar → {} (só na primeira vez que o app abre no aparelho)
- abrir → { "icone": "URL https pública do ícone do app (opcional)" } (toda vez que o app abre; se o ícone do projeto estiver publicado na internet, mande a URL dele aqui e o painel passa a mostrar o ícone original)
- ping → {} (a cada 60 segundos enquanto o usuário está com o app aberto e visível: mantém ele como ONLINE)
- saiu → {} (quando o usuário fecha ou minimiza o app: marca como OFFLINE)
- entrou → {} (jogador conectou no servidor do jogo: marca como ONLINE)
- cadastro → { "metodo": "google" | "email" | "apple" | "anonimo" }
- login → { "metodo": "google" | "email" | ... }
- assinatura → { "plano": "mensal" | "anual" | "semanal", "valor": 19.9, "status": "ativa" | "renovada" | "cancelada" | "expirada" | "reembolsada", "expira_em": "data ISO (opcional)" }
- transacao → { "valor": 4.9, "item": "500 moedas", "tipo": "compra" | "reembolso" }
- presente → { "para": "nome ou id de quem recebeu", "item": "Rosa", "valor": 1 }
- partida → { "abates": 12, "vitoria": true, "minutos": 8, "modo": "Squad" }
- erro → { "mensagem": "texto do erro" } (capture erros não tratados)
- feedback → { "tipo": "bug" | "sugestao", "mensagem": "...", "contato": "..." }
- servidor → { "online": número de jogadores conectados agora, "versao": "1.0.0" } (SÓ no servidor, a cada 60 segundos; não precisa de "usuario")
- servidor_parou → {} (quando o servidor desligar)
- Qualquer outro evento importante do projeto: invente um tipo em minúsculas com _ (ex.: "nivel_concluido") e mande os detalhes em "dados".

## O que fazer
1. Veja a tecnologia do projeto (site, app, jogo, com ou sem servidor) e crie um módulo/arquivo único de integração (ex.: painel.js, Painel.cs, painel.dart) com uma função para enviar eventos com fila e lotes.
2. Envie automaticamente: instalar, abrir, ping a cada 60 s, saiu, e erro.
3. Procure no código onde acontecem: cadastro e login (com o método), assinaturas/pagamentos, compras, envio de presentes, partidas, e conexão/desconexão de jogadores. Chame o evento certo em cada lugar, com os dados reais.
4. Se o projeto tiver servidor (Node, Python, etc.), envie de lá o evento "servidor" a cada 60 segundos com o número de jogadores online, e "servidor_parou" ao desligar. Pagamentos e assinaturas devem ser enviados preferencialmente pelo servidor, depois de confirmados.
5. Segurança: se houver servidor, guarde a chave em variável de ambiente (PAINEL_CHAVE) e não deixe ela no código público. Se o projeto for só front-end, pode deixar a chave no código.
6. Não mande senhas, e-mails, CPF ou dados de cartão nos eventos.
7. No fim, me diga em quais arquivos e lugares você colocou cada evento, e o que eu preciso fazer (se precisar de algo).

Chave deste projeto: ${chave}`;
}
function renderAppCode() { const pr = appInt === 'Prompt para IA'; $('acode').textContent = codeFor(appSel, appInt); $('acode').style.whiteSpace = pr ? 'pre-wrap' : ''; $('acopy').textContent = pr ? 'Copiar prompt' : 'Copiar código'; }
$('acopy').onclick = () => copy(codeFor(appSel, appInt), appInt === 'Prompt para IA' ? 'Prompt copiado. Cole na IA do seu projeto.' : 'Código copiado');

/* ================= Métricas ================= */
function renderReports() {
  const cur = $('rproj').value, withData = S.projetos.filter(p => S.eventos.some(e => e.projeto_id === p.id));
  $('rproj').innerHTML = '<option value="">Todos os projetos</option>' + withData.map(p => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${esc(p.nome)}</option>`).join('');
  const pid = $('rproj').value || null, lim = Date.now() - 30 * DAY, lim2 = Date.now() - 60 * DAY;
  const E = evOf(pid), in30 = e => new Date(e.criado_em) > lim, in60 = e => new Date(e.criado_em) > lim2 && !in30(e);
  const ab30 = E.filter(e => e.tipo === 'abrir' && in30(e)), u30 = new Set(ab30.map(e => e.usuario)).size, u60 = new Set(E.filter(e => e.tipo === 'abrir' && in60(e)).map(e => e.usuario)).size;
  const err30 = E.filter(e => e.tipo === 'erro' && in30(e)).length, sess = ab30.length;
  $('rstats').innerHTML = [['down', num(E.filter(e => e.tipo === 'instalar').length), 'Instalações (12 meses)'], ['team', num(u30), 'Usuários (30 dias)', trend(u30, u60)], ['clock', u30 ? (sess / u30).toFixed(1).replace('.', ',') : '0', 'Sessões por usuário'], ['bug', sess ? (100 - err30 / sess * 100).toFixed(1).replace('.', ',') + '%' : '—', 'Sessões sem erro']].map(stat).join('');
  const R = S.projetos.map(p => [p.nome, users30(p.id)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]).slice(0, 8), m = R[0]?.[1] || 1;
  $('rank').innerHTML = R.length ? R.map((x, i) => `<div><span>${i + 1}. ${esc(x[0])}</span><span class="bar"><i style="width:${x[1] / m * 100}%"></i></span><b class="r">${num(x[1])}</b></div>`).join('') : '<p class="empty">Ligue seus apps ao painel (veja dentro de cada projeto) para ver os números.</p>';
}
$('rproj').onchange = () => { renderReports(); drawAll(); };

/* ================= Tarefas + calendário ================= */
let tview = 'Quadro', calM = new Date(); calM.setDate(1);
function projOptions(sel, all) { return (all ? '<option value="">Todos os projetos</option>' : '<option value="">Sem projeto</option>') + S.projetos.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.nome)}</option>`).join(''); }
function renderTasks() {
  const f = $('tfil').value; $('tfil').innerHTML = projOptions(f, 1); $('tw').innerHTML = projOptions($('tw').value || f);
  const L = S.tarefas.filter(t => !f || t.projeto_id === f), open = S.tarefas.filter(t => t.coluna < 2).length;
  $('tsum').textContent = open + ' abertas · ' + (S.tarefas.length - open) + ' concluídas · ' + S.tarefas.filter(t => t.coluna < 2 && t.prazo && t.prazo < today()).length + ' atrasadas';
  $('nb-tasks').textContent = open;
  $('kan').hidden = tview !== 'Quadro'; $('calBox').hidden = tview === 'Quadro';
  $('kan').innerHTML = COLS.map((c, ci) => { const C = L.filter(t => t.coluna == ci); return `<div class="col glass"><h3>${c}<span class="chip" style="background:var(--glass2)">${C.length}</span></h3>${C.length ? C.map(t => `<div class="task"><div style="display:flex;justify-content:space-between;gap:6px"><span class="tag pri-${t.prioridade}">${PR[t.prioridade]}</span>${prazoTag(t)}</div><b style="margin-top:6px${ci == 2 ? ';text-decoration:line-through;opacity:.7' : ''}">${esc(t.titulo)}</b><small>${esc(pname(t.projeto_id))}</small><div class="acts">${ci > 0 ? `<button class="mini" data-m="${t.id}" data-d="-1">← Voltar</button>` : ''}${ci < 2 ? `<button class="mini" data-m="${t.id}" data-d="1">${ci ? 'Concluir ✓' : 'Iniciar →'}</button>` : ''}<button class="mini" data-x="${t.id}">Excluir</button></div></div>`).join('') : '<p class="empty">Nada aqui.</p>'}</div>`; }).join('');
  // calendário
  const ct = calM.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); $('calTitle').textContent = ct[0].toUpperCase() + ct.slice(1);
  const first = new Date(calM), start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
  let h = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => `<div class="wd">${d}</div>`).join('');
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i); const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const T = L.filter(t => t.prazo === ds);
    h += `<div class="d${d.getMonth() !== calM.getMonth() ? ' out' : ''}${ds === today() ? ' today' : ''}"><b>${d.getDate()}</b>${T.map(t => `<span class="ev${t.coluna < 2 && ds < today() ? ' late' : ''}" title="${esc(t.titulo)} · ${esc(pname(t.projeto_id))}" style="${t.coluna == 2 ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(t.titulo)}</span>`).join('')}</div>`;
    if (i === 34 && d.getMonth() !== calM.getMonth()) break;
  }
  $('cal').innerHTML = h;
}
$('kan').onclick = e => { const b = e.target.closest('button'); if (!b) return; act(async () => { if (b.dataset.x) await Store.del('tarefas', b.dataset.x); else { const t = S.tarefas.find(x => x.id === b.dataset.m); await Store.upd('tarefas', t.id, { coluna: t.coluna + +b.dataset.d }); } renderAll(); }); };
$('tf').onsubmit = e => { e.preventDefault(); act(async () => { await Store.add('tarefas', { titulo: $('tt').value.trim(), projeto_id: $('tw').value || null, prioridade: $('tp').value, coluna: 0, prazo: $('td').value || null }); $('tt').value = ''; $('td').value = ''; renderAll(); }, 'Tarefa adicionada'); };
$('tfil').onchange = renderTasks;
seg('tview', t => { tview = t; renderTasks(); });
$('calPrev').onclick = () => { calM.setMonth(calM.getMonth() - 1); renderTasks(); };
$('calNext').onclick = () => { calM.setMonth(calM.getMonth() + 1); renderTasks(); };

/* ================= Bugs e sugestões ================= */
let bf = 'Abertos';
function renderBugs() {
  const pf = $('bproj').value; $('bproj').innerHTML = projOptions(pf, 1);
  const L = S.feedback.filter(f => (bf === 'Todos' || (bf === 'Abertos') === !f.resolvido) && (!pf || f.projeto_id === pf));
  const o = openBugs().length; $('bsum').textContent = o + ' abertos · ' + (S.feedback.length - o) + ' resolvidos';
  $('nb-bugs').textContent = o || ''; $('nb-bugs').hidden = !o; $('bellDot').hidden = !o;
  $('bugs').innerHTML = L.length ? L.map(f => `<div class="li" style="align-items:flex-start"><div class="ico" style="margin:0">${svg(f.tipo === 'bug' ? 'bug' : 'bulb')}</div><div class="grow"><b>${f.tipo === 'bug' ? 'Bug' : 'Sugestão'} · ${esc(pname(f.projeto_id))}</b><p style="margin:4px 0">${esc(f.mensagem)}</p><small>${f.contato ? esc(f.contato) + ' · ' : ''}${ago(f.criado_em)}</small>
    <div class="acts" style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="mini" data-r="${f.id}">${f.resolvido ? 'Reabrir' : 'Marcar resolvido ✓'}</button><button class="mini" data-tk="${f.id}">Virar tarefa</button><button class="mini" data-x="${f.id}">Excluir</button></div></div>${f.resolvido ? '<span class="tag up">Resolvido</span>' : ''}</div>`).join('') : `<p class="empty">${bf === 'Abertos' ? 'Nenhum bug aberto. 🎉' : 'Nada aqui.'}</p>`;
}
$('bugs').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.r) act(async () => { const f = S.feedback.find(x => x.id === b.dataset.r); await Store.upd('feedback', f.id, { resolvido: !f.resolvido }); renderAll(); });
  if (b.dataset.tk) act(async () => { const f = S.feedback.find(x => x.id === b.dataset.tk); await Store.add('tarefas', { titulo: (f.tipo === 'bug' ? 'Corrigir: ' : 'Fazer: ') + f.mensagem.slice(0, 180), projeto_id: f.projeto_id, prioridade: f.tipo === 'bug' ? 'a' : 'm', coluna: 0 }); renderAll(); }, 'Tarefa criada');
  if (b.dataset.x) act(async () => { await Store.del('feedback', b.dataset.x); renderAll(); }, 'Excluído');
};
seg('bf', t => { bf = t; renderBugs(); });
$('bproj').onchange = renderBugs;

/* ================= Ranking de jogadores ================= */
function renderRanking() {
  const games = S.projetos.filter(p => p.tipo === 'Jogo'), cur = $('gproj').value;
  $('gproj').innerHTML = games.map(p => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${esc(p.nome)}</option>`).join('') || '<option value="">Nenhum jogo</option>';
  const pid = $('gproj').value, M = {};
  for (const e of evOf(pid, 'partida')) { const n = (e.dados?.nome || shortUser(e.usuario)).slice(0, 40), x = M[n] ||= { n, k: 0, p: 0, w: 0, m: 0 }; x.k += +e.dados?.abates || 0; x.p++; x.w += e.dados?.vitoria ? 1 : 0; x.m += +e.dados?.minutos || 0; }
  const L = Object.values(M).sort((a, b) => b.k - a.k || b.w - a.w), tot = L.reduce((a, x) => ({ k: a.k + x.k, p: a.p + x.p, m: a.m + x.m }), { k: 0, p: 0, m: 0 });
  $('gstats').innerHTML = [['team', num(L.length), 'Jogadores'], ['game', num(tot.p), 'Partidas'], ['trophy', num(tot.k), 'Abates no total'], ['clock', tot.p ? Math.round(tot.m / tot.p) + ' min' : '—', 'Duração média']].map(stat).join('');
  const medal = ['🥇', '🥈', '🥉'];
  $('gtab').innerHTML = L.length ? L.slice(0, 50).map((x, i) => `<tr><td>${medal[i] || i + 1}</td><td><span class="who"><span class="av">${esc(ini(x.n))}</span>${esc(x.n)}</span></td><td class="r"><b>${num(x.k)}</b></td><td class="r">${x.p}</td><td class="r">${x.w}</td><td class="r">${x.m} min</td></tr>`).join('') : '<tr><td colspan="6" class="empty">Nenhuma partida ainda. No jogo, chame painel.partida(nome, abates, venceu, minutos) no fim de cada partida.</td></tr>';
}
$('gproj').onchange = renderRanking;

/* ================= Usuários ================= */
function renderUsers() {
  const q = $('mq').value.toLowerCase(), M = {};
  for (const e of S.eventos) { const k = e.projeto_id + '|' + e.usuario, x = M[k] ||= { u: e.usuario, n: e.dados?.nome, p: e.projeto_id, pl: e.plataforma, s: 0, t: e.criado_em }; if (e.tipo === 'abrir') x.s++; if (e.criado_em > x.t) x.t = e.criado_em; if (e.dados?.nome) x.n = e.dados.nome; }
  const all = Object.values(M), L = all.filter(x => ((x.n || shortUser(x.u)) + ' ' + pname(x.p)).toLowerCase().includes(q)).sort((a, b) => String(b.t).localeCompare(String(a.t)));
  $('msum').textContent = num(all.length) + ' usuários em 12 meses · ' + num(users30()) + ' nos últimos 30 dias';
  $('users').innerHTML = L.length ? L.slice(0, 150).map(x => { const n = x.n || shortUser(x.u); return `<tr><td><span class="who"><span class="av">${esc(ini(n))}</span>${esc(n)}</span></td><td>${esc(pname(x.p))}</td><td>${esc(x.pl || '—')}</td><td class="r">${x.s}</td><td>${ago(x.t)}</td></tr>`; }).join('') : '<tr><td colspan="5" class="empty">Ninguém ainda. Ligue um app ao painel para ver quem usa.</td></tr>';
}
$('mq').oninput = renderUsers;

/* ================= Receita ================= */
const thisMonth = () => mk(Date.now());
const monthRevenue = () => S.receita.filter(r => mk(r.mes + 'T12:00:00') === thisMonth()).reduce((a, r) => a + +r.valor, 0);
function profitByMonth() { return months12().map(k => [k, S.receita.filter(r => r.mes.slice(0, 7) === k).reduce((a, r) => a + (+r.valor - +r.custo), 0)]); }
function renderFinance() {
  const R = S.receita.filter(r => r.mes.slice(0, 7) === thisMonth()), rec = R.reduce((a, r) => a + +r.valor, 0), cus = R.reduce((a, r) => a + +r.custo, 0);
  const pm = new Date(); pm.setDate(1); pm.setMonth(pm.getMonth() - 1); const prev = S.receita.filter(r => r.mes.slice(0, 7) === mk(pm)).reduce((a, r) => a + +r.valor, 0);
  $('fstats').innerHTML = [['money', fmt(rec), 'Receita do mês', trend(rec, prev)], ['code', fmt(cus), 'Custos do mês'], ['up', fmt(rec - cus), 'Lucro do mês'], ['star', fmt(S.receita.reduce((a, r) => a + +r.valor, 0)), 'Receita total']].map(stat).join('');
  $('metaTxt').textContent = fmt(prefs.meta) + ' de receita';
  $('mdone').textContent = fmt(rec); $('mleft').textContent = fmt(Math.max(0, prefs.meta - rec));
  $('rp').innerHTML = projOptions($('rp').value);
  if (!$('rm').value) $('rm').value = thisMonth();
  const L = [...S.receita].sort((a, b) => b.mes.localeCompare(a.mes) || String(b.criado_em).localeCompare(String(a.criado_em)));
  $('pay').innerHTML = L.length ? L.slice(0, 60).map(r => `<tr><td>${mlabel(r.mes.slice(0, 7))}/${r.mes.slice(2, 4)}</td><td>${esc(pname(r.projeto_id))}</td><td>${r.fonte}</td><td class="r">${fmt(r.valor)}</td><td class="r">${fmt(r.custo)}</td><td class="r"><b>${fmt(r.valor - r.custo)}</b></td><td><button class="mini" data-x="${r.id}" aria-label="Excluir">Excluir</button></td></tr>`).join('') : '<tr><td colspan="7" class="empty">Nenhum lançamento. Use o formulário acima.</td></tr>';
}
$('rf').onsubmit = e => { e.preventDefault(); act(async () => { await Store.add('receita', { projeto_id: $('rp').value || null, mes: $('rm').value + '-01', fonte: $('rs').value, valor: +$('rv').value || 0, custo: +$('rc').value || 0 }); $('rv').value = $('rc').value = ''; renderAll(); }, 'Receita lançada'); };
$('pay').onclick = e => { const b = e.target.closest('[data-x]'); if (b) act(async () => { await Store.del('receita', b.dataset.x); renderAll(); }, 'Lançamento excluído'); };
function download(name, text, type) {
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('Baixando ' + name); }
  catch (e) { copy(text, 'Não deu para baixar aqui, então copiei o conteúdo.'); }
}
$('csvBtn').onclick = () => { const rows = [['mes', 'projeto', 'fonte', 'receita', 'custo', 'lucro'], ...S.receita.map(r => [r.mes.slice(0, 7), pname(r.projeto_id), r.fonte, r.valor, r.custo, (r.valor - r.custo).toFixed(2)])]; download('receita.csv', rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\n'), 'text/csv'); };

/* ================= Ideias ================= */
let ifl = 'Todas';
function renderIdeas() {
  const L = S.ideias.filter(i => ifl === 'Todas' || i.categoria === ifl);
  $('ideas').innerHTML = L.length ? L.map(i => `<div class="c glass idea"><div class="row" style="display:flex;justify-content:space-between"><span class="pill">${esc(i.categoria)}</span><small style="color:var(--mut)">${ago(i.criado_em)}</small></div><b style="font-size:17px">${esc(i.titulo)}</b><p>${esc(i.texto)}</p><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto">${['Jogo', 'App', 'Site'].includes(i.categoria) ? `<button class="mini" data-p="${i.id}">Virar projeto 🚀</button>` : ''}<button class="mini" data-x="${i.id}">Excluir</button></div></div>`).join('') : '<p class="empty">Nenhuma ideia aqui ainda.</p>';
}
$('idf').onsubmit = e => { e.preventDefault(); act(async () => { await Store.add('ideias', { titulo: $('it').value.trim(), categoria: $('ic').value, texto: $('ix').value.trim() }); $('it').value = $('ix').value = ''; renderAll(); }, 'Ideia salva'); };
$('ideas').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.x) act(async () => { await Store.del('ideias', b.dataset.x); renderAll(); }, 'Ideia excluída');
  if (b.dataset.p) act(async () => { const i = S.ideias.find(x => x.id === b.dataset.p); const p = await Store.add('projetos', { nome: i.titulo.slice(0, 80), tipo: ['Jogo', 'Site'].includes(i.categoria) ? i.categoria : 'App', tecnologia: '', status: 0, progresso: 0, notas: i.texto }); await Store.del('ideias', i.id); renderAll(); nav('projects'); openProject(p.id); }, 'Ideia virou projeto!');
};
seg('if', t => { ifl = t; renderIdeas(); });

/* ================= Atualizações ================= */
function renderAnns() {
  $('ap').innerHTML = S.projetos.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('');
  $('anns').innerHTML = S.versoes.length ? S.versoes.map(v => `<div class="ann"><div class="ico" style="margin:0">${svg('up')}</div><div style="flex:1;min-width:0"><b>${esc(pname(v.projeto_id))} <span class="pill">${esc(v.versao)}</span></b><p>${esc(v.texto)}</p></div><time>${ago(v.criado_em)}</time><button class="mini" data-x="${v.id}" aria-label="Excluir">✕</button></div>`).join('') : '<p class="empty">Nenhuma versão publicada ainda.</p>';
}
$('annf').onsubmit = e => { e.preventDefault(); if (!$('ap').value) return toast('Crie um projeto primeiro'); act(async () => { await Store.add('versoes', { projeto_id: $('ap').value, versao: $('av').value.trim(), texto: $('ab').value.trim() }); $('av').value = $('ab').value = ''; renderAll(); }, 'Atualização publicada'); };
$('anns').onclick = e => { const b = e.target.closest('[data-x]'); if (b) act(async () => { await Store.del('versoes', b.dataset.x); renderAll(); }, 'Versão excluída'); };

/* ================= Configurações ================= */
let email = '';
const CORES = ['#22d3ee', '#34d399', '#a78bfa', '#fbbf24', '#fb7185', '#60a5fa'];
$('sws').innerHTML = CORES.map(c => `<button style="background:${c}" data-c="${c}" aria-label="Cor ${c}"></button>`).join('');
function applyPrefs() {
  document.documentElement.style.setProperty('--acc', prefs.acc);
  document.body.dataset.modo = prefs.modo === 'claro' ? 'claro' : '';
  document.querySelector('meta[name=theme-color]').content = prefs.modo === 'claro' ? '#d2eff2' : '#0c3240';
  $('sws').querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.c === prefs.acc));
  $('modo').checked = prefs.modo === 'claro';
}
function renderSettings() {
  $('pn').value = prefs.nome; $('pg').value = prefs.github; $('pm').value = prefs.meta;
  $('sname').textContent = prefs.nome; $('smail').textContent = email; $('sav').textContent = ini(prefs.nome);
  $('uname').textContent = prefs.nome; $('umail').textContent = Store.mode === 'demo' ? 'Modo demonstração' : 'Acesso por código'; $('uav').textContent = ini(prefs.nome);
  $('ghLink').href = 'https://github.com/' + encodeURIComponent(prefs.github);
  $('logout').textContent = Store.mode === 'demo' ? 'Sair da demonstração' : 'Bloquear painel';
  $('foot').textContent = Store.mode === 'demo' ? 'Modo demonstração: dados de exemplo salvos só neste navegador.' : 'Conectado ao Supabase. O painel bloqueia quando o app é fechado.';
  const N = [['cadastro', 'Novo cadastro', 'Quando alguém cria conta num app'], ['erro', 'Erros', 'Quando um app dá erro'], ['feedback', 'Bugs e sugestões', 'Quando chega uma mensagem nova']];
  $('nots').innerHTML = N.map(([k, t, d]) => `<label class="sw"><span><b>${t}</b><small>${d}</small></span><input type="checkbox" class="tg" data-n="${k}" ${prefs.nots[k] ? 'checked' : ''}></label>`).join('');
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  $('permBtn').textContent = perm === 'granted' ? 'Notificações permitidas ✓' : perm === 'unsupported' ? 'Este navegador não mostra notificações' : 'Permitir notificações no aparelho';
  $('permBtn').disabled = perm !== 'default';
}
$('saveP').onclick = () => { prefs.nome = $('pn').value.trim() || 'Carlos André'; prefs.github = $('pg').value.trim() || 'carlosandre1514-prog'; prefs.meta = Math.max(1, +$('pm').value || 1000); savePrefs(); renderAll(); toast('Configurações salvas'); };
$('modo').onchange = e => { prefs.modo = e.target.checked ? 'claro' : 'escuro'; savePrefs(); applyPrefs(); drawAll(); };
$('sws').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; prefs.acc = b.dataset.c; savePrefs(); applyPrefs(); drawAll(); };
$('nots').onchange = e => { const k = e.target.dataset.n; if (k) { prefs.nots[k] = e.target.checked ? 1 : 0; savePrefs(); } };
$('permBtn').onclick = async () => { try { await Notification.requestPermission(); } catch (e) {} renderSettings(); };
$('testN').onclick = () => {
  const p = S.projetos[0]; if (!p) return toast('Crie um projeto primeiro');
  const row = { id: 'teste-' + Date.now(), projeto_id: p.id, tipo: 'bug', mensagem: 'Notificação de teste: está tudo funcionando!', contato: '', resolvido: false, criado_em: new Date().toISOString() };
  if (Store.mode === 'demo') Store.inject('feedback', row);
  onLive('feedback', row, true);
};
$('logout').onclick = async () => { await Store.signOut(); location.hash = ''; showLogin(); $('lp').focus(); };
$('exitDemo').onclick = $('logout').onclick;
$('expBtn').onclick = () => download('painel-backup-' + today() + '.json', JSON.stringify(Store.backup(), null, 1), 'application/json');
$('copyBtn').onclick = () => copy(JSON.stringify(Store.backup()), 'Backup copiado. Cole num arquivo .json para guardar.');
$('impFile').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  await act(async () => { const o = JSON.parse(await f.text()); await Store.restore(o); renderAll(); }, 'Backup restaurado');
  e.target.value = '';
};

/* ================= Notificações em tempo real ================= */
let rt;
function notify(title, body) {
  toast(title + ': ' + body);
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opt = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' };
  if (navigator.serviceWorker?.controller) navigator.serviceWorker.ready.then(r => r.showNotification(title, opt)).catch(() => {});
  else { try { new Notification(title, opt); } catch (e) {} }
}
function onLive(t, row, force) {
  if (t === 'eventos' && appD && !appD.erro && row.projeto_id === appD.pid && appD.eventos !== S.eventos) appD.eventos.unshift(row);
  const p = pname(row.projeto_id);
  if (t === 'feedback' && (prefs.nots.feedback || force)) notify(row.tipo === 'bug' ? 'Bug novo em ' + p : 'Sugestão nova em ' + p, row.mensagem);
  if (t === 'eventos' && row.tipo === 'cadastro' && prefs.nots.cadastro) notify('Novo cadastro', p + ' ganhou um usuário');
  if (t === 'eventos' && row.tipo === 'erro' && prefs.nots.erro) notify('Erro em ' + p, row.dados?.mensagem || 'Sem detalhes');
  clearTimeout(rt); rt = setTimeout(renderAll, 400);
}

/* ================= Login ================= */
function showLogin(msg, ok) {
  closeDrawer(); $('shell').hidden = true; $('login').hidden = false;
  $('lmsg').hidden = !msg; $('lmsg').textContent = msg || ''; $('lmsg').className = 'msg' + (ok ? ' ok' : '');
}
function loginErr(e) {
  const m = String(e?.message || e);
  if (/Invalid login/i.test(m)) return 'Código errado.';
  if (/fetch|network|carregar o Supabase/i.test(m)) return 'Sem conexão com o Supabase. Verifique a internet.';
  return m;
}
const busy = (b, on) => { b.disabled = on; b.style.opacity = on ? .6 : 1; };
$('lf').onsubmit = async e => {
  e.preventDefault(); busy($('lbtn'), true);
  try { const s = await Store.signIn($('lp').value); $('lp').value = ''; await enter(s); }
  catch (er) { showLogin(loginErr(er)); $('lp').select(); }
  busy($('lbtn'), false);
};

async function enter(session) {
  email = session?.user?.email || '';
  $('login').hidden = true; $('shell').hidden = false; $('demoBar').hidden = Store.mode !== 'demo';
  await act(() => Store.load());
  renderAll(); go();
  setTimeout(autoIconsAll, 1500);
  Store.live(onLive);
}

/* ================= Render geral ================= */
function renderAll() {
  if ($('shell').hidden) return;
  renderOverview(); renderProjects(); renderReports(); renderTasks(); renderBugs(); renderRanking(); renderUsers(); renderFinance(); renderIdeas(); renderAnns(); renderSettings(); if (view === 'apps') renderApps();
  drawAll();
}

/* ================= PWA ================= */
if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|anthropic/.test(location.hostname)) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

/* Rótulos das tabelas no celular */
new MutationObserver(() => { for (const c of document.querySelectorAll('.stack td:not([data-l])')) { let i = 0, p = c; while ((p = p.previousElementSibling)) i += p.colSpan; c.dataset.l = c.closest('table').rows[0].cells[i]?.textContent || ''; } }).observe(document.body, { childList: true, subtree: true });

/* ================= Início ================= */
(async () => {
  applyPrefs();
  const s = await Store.session();
  if (s) { Store.useSb(); await enter(s); }
  else { showLogin(); $('lp').focus(); }
})();
}
