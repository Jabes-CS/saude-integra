/* =====================================================================
   Tela 5 — Administração (Richard)
   Funções: disponibilidade, financeiro, observações, ERPs (demo)
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  listarSalas();
  listarFinanceiro();
  listarObs();
});

/* ---------- FUNÇÃO 1: disponibilidade ---------- */
function listarSalas() {
  const salas = DB.ler('salas');
  const ul = document.getElementById('lista-salas');
  ul.innerHTML = salas.map(s => `
    <li class="item">
      <i class="ti ti-${s.tipo === 'sala' ? 'door' : 'user'}" style="font-size:20px;color:var(--cor-apoio)"></i>
      <div class="item__principal"><strong>${Util.escape(s.nome)}</strong><span>${s.tipo === 'sala' ? 'Sala' : 'Profissional'}</span></div>
      <span class="status status--${s.disponivel ? 'ok' : 'erro'}">${s.disponivel ? 'disponível' : 'ocupado'}</span>
      <button class="btn btn--contorno btn--pequeno" onclick="alternarSala('${s.id}')"><i class="ti ti-switch-horizontal"></i> Alternar</button>
    </li>`).join('');
}

function alternarSala(id) {
  const salas = DB.ler('salas');
  const s = salas.find(x => x.id === id);
  s.disponivel = !s.disponivel;
  DB.salvar('salas', salas);
  listarSalas();
  Util.aviso(`${s.nome} agora está ${s.disponivel ? 'disponível' : 'ocupado'}.`);
}

/* ---------- FUNÇÃO 2: financeiro ---------- */
function lancar() {
  const descricao = document.getElementById('fin-desc').value.trim();
  const valor = parseFloat(document.getElementById('fin-valor').value);
  if (!descricao || !valor) { Util.aviso('Preencha descrição e valor.', 'pendente'); return; }
  const fin = DB.ler('financeiro');
  fin.unshift({ id: DB.novoId(), descricao, tipo: document.getElementById('fin-tipo').value, valor: Math.abs(valor), data: new Date().toISOString().slice(0, 10) });
  DB.salvar('financeiro', fin);
  document.getElementById('fin-desc').value = '';
  document.getElementById('fin-valor').value = '';
  listarFinanceiro();
  Util.aviso('Lançamento registrado.');
}

function listarFinanceiro() {
  const fin = DB.ler('financeiro');
  const entradas = fin.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0);
  const saidas = fin.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);
  document.getElementById('fin-metricas').innerHTML = `
    <div class="metrica"><div class="rotulo">Entradas</div><div class="valor" style="color:var(--cor-primaria)">${Util.moeda(entradas)}</div></div>
    <div class="metrica"><div class="rotulo">Saídas</div><div class="valor" style="color:var(--status-erro-texto)">${Util.moeda(saidas)}</div></div>
    <div class="metrica"><div class="rotulo">Saldo</div><div class="valor">${Util.moeda(entradas - saidas)}</div></div>`;

  const corpo = document.getElementById('lista-financeiro');
  if (!fin.length) { corpo.innerHTML = '<tr><td colspan="4" class="vazio">Sem lançamentos.</td></tr>'; return; }
  corpo.innerHTML = fin.map(t => `
    <tr>
      <td><strong>${Util.escape(t.descricao)}</strong></td>
      <td><span class="status status--${t.tipo === 'entrada' ? 'ok' : 'erro'}">${t.tipo}</span></td>
      <td>${t.tipo === 'saida' ? '−' : '+'} ${Util.moeda(t.valor)}</td>
      <td>${Util.dataBR(t.data)}</td>
    </tr>`).join('');
}

/* ---------- FUNÇÃO 3: observações ---------- */
function adicionarObs() {
  const texto = document.getElementById('obs-texto').value.trim();
  if (!texto) { Util.aviso('Escreva a observação.', 'pendente'); return; }
  const obs = DB.ler('observacoes');
  obs.unshift({ id: DB.novoId(), autor: 'Richard', texto, data: new Date().toISOString().slice(0, 10) });
  DB.salvar('observacoes', obs);
  document.getElementById('obs-texto').value = '';
  listarObs();
  Util.aviso('Observação registrada.');
}

function listarObs() {
  const obs = DB.ler('observacoes');
  const ul = document.getElementById('lista-obs');
  if (!obs.length) { ul.innerHTML = '<li class="vazio">Nenhuma observação.</li>'; return; }
  ul.innerHTML = obs.map(o => `
    <li class="item">
      <i class="ti ti-note" style="font-size:20px;color:var(--cor-apoio)"></i>
      <div class="item__principal"><strong>${Util.escape(o.texto)}</strong><span>${Util.escape(o.autor)} · ${Util.dataBR(o.data)}</span></div>
    </li>`).join('');
}