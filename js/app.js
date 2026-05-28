/* =====================================================================
   SaúdeIntegra — Lógica compartilhada (app.js)
   ---------------------------------------------------------------------
   Este arquivo faz 3 coisas em TODAS as telas:
   1) Monta a barra de menu do topo (por isso o menu é igual em todo lugar)
   2) Aplica e guarda o tema de cor escolhido
   3) Oferece funções de apoio (avisos, formatar data/dinheiro, exportar CSV)

   Em cada tela, basta ter no HTML:  <div id="appbar"></div>
   que o menu aparece sozinho.
   ===================================================================== */

/* ---------- 1. MENU DO TOPO ---------- */
const TELAS = [
  { arq: 'index.html',                 nome: 'Início',        icone: 'ti-home' },
  { arq: 'tela1-pacientes.html',       nome: 'Pacientes',     icone: 'ti-users' },
  { arq: 'tela2-agenda.html',          nome: 'Agenda',        icone: 'ti-calendar' },
  { arq: 'tela3-faturamento.html',     nome: 'Faturamento',   icone: 'ti-receipt' },
  { arq: 'tela4-atendimentos.html',    nome: 'Atendimentos',  icone: 'ti-stethoscope' },
  { arq: 'tela5-administrativo.html',  nome: 'Administração', icone: 'ti-building-bank' }
];

function montarMenu() {
  const alvo = document.getElementById('appbar');
  if (!alvo) return;
  const atual = location.pathname.split('/').pop() || 'index.html';

  const links = TELAS.map(t => `
    <a class="appbar__link ${t.arq === atual ? 'ativo' : ''}" href="${t.arq}">
      <i class="ti ${t.icone}"></i>${t.nome}
    </a>`).join('');

  alvo.className = 'appbar';
  alvo.innerHTML = `
    <a class="appbar__marca" href="index.html">
      <span class="appbar__logo"><i class="ti ti-plus"></i></span>
      <span>SaúdeIntegra</span>
    </a>
    <nav class="appbar__nav">${links}</nav>
    <div class="appbar__acoes">
      <button class="icone-botao" id="btn-modo" title="Alternar modo claro/escuro"><i class="ti ti-moon"></i></button>
      <div class="appbar__usuario">
        <span class="appbar__avatar">JS</span>
      </div>
    </div>`;

  document.getElementById('btn-modo').onclick = Tema.alternarEscuro;
}

/* ---------- 2. TEMAS DE COR ---------- */
const Tema = {
  lista: [
    { id: 'verde',  nome: 'Verde (padrão)' },
    { id: 'oceano', nome: 'Oceano' },
    { id: 'ameixa', nome: 'Ameixa' },
    { id: 'coral',  nome: 'Coral' },
    { id: 'escuro', nome: 'Escuro' }
  ],
  atual() { return localStorage.getItem('si_tema') || 'verde'; },
  aplicar(id) {
    if (id === 'verde') document.documentElement.removeAttribute('data-tema');
    else document.documentElement.setAttribute('data-tema', id);
    localStorage.setItem('si_tema', id);
    const btn = document.querySelector('#btn-modo i');
    if (btn) btn.className = 'ti ' + (id === 'escuro' ? 'ti-sun' : 'ti-moon');
  },
  alternarEscuro() {
    Tema.aplicar(Tema.atual() === 'escuro' ? 'verde' : 'escuro');
  }
};

/* ---------- 3. FUNÇÕES DE APOIO (Util) ---------- */
const Util = {
  escape(t = '') { return String(t).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); },

  dataBR(iso) { if (!iso) return ''; const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; },

  moeda(n) { return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); },

  idade(nasc) {
    const d = new Date(nasc), h = new Date();
    let i = h.getFullYear() - d.getFullYear();
    if (h.getMonth() < d.getMonth() || (h.getMonth() === d.getMonth() && h.getDate() < d.getDate())) i--;
    return i;
  },

  nomePaciente(id) {
    const p = DB.ler('pacientes').find(x => x.id === id);
    return p ? p.nome : '—';
  },

  /* mostra um aviso flutuante no canto da tela */
  aviso(msg, tipo = 'ok') {
    let caixa = document.getElementById('avisos');
    if (!caixa) { caixa = document.createElement('div'); caixa.id = 'avisos'; document.body.appendChild(caixa); }
    const el = document.createElement('div');
    el.className = 'aviso aviso--' + tipo;
    el.innerHTML = `<i class="ti ti-circle-check"></i>${Util.escape(msg)}`;
    caixa.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  },

  /* gera e baixa um arquivo .csv (abre no Excel) — usado na Tela 3 */
  baixarCSV(nomeArquivo, cabecalho, linhas) {
    const conteudo = [cabecalho, ...linhas]
      .map(l => l.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nomeArquivo;
    a.click();
  }
};

/* ---------- 4. INICIALIZAÇÃO (roda em toda tela) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  Tema.aplicar(Tema.atual());
  montarMenu();
});