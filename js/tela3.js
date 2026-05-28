/* =====================================================================
   Tela 3 — Faturamento e confirmações (Jabes)
   Funções: confirmação WhatsApp/SMS, faturamento, exportação, portal (demo)
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  listarConfirmacao();
  montarFiltroConvenio();
  listarFaturas();
});

/* ---------- FUNÇÃO 1: confirmação de consultas ---------- */
function listarConfirmacao() {
  const consultas = DB.ler('consultas').filter(c => c.status !== 'cancelada')
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  const ul = document.getElementById('lista-confirmacao');
  if (!consultas.length) { ul.innerHTML = '<li class="vazio">Nenhuma consulta para confirmar.</li>'; return; }
  const cls = { confirmada: 'ok', pendente: 'pendente' };
  ul.innerHTML = consultas.map(c => `
    <li class="item">
      <div class="item__principal">
        <strong>${Util.escape(Util.nomePaciente(c.pacienteId))}</strong>
        <span><i class="ti ti-clock" style="vertical-align:-2px"></i> ${Util.dataBR(c.data)} às ${c.hora} · ${Util.escape(c.profissional)}</span>
      </div>
      <span class="status status--${cls[c.status]}">${c.status}</span>
      ${c.status === 'pendente'
        ? `<button class="btn btn--principal btn--pequeno" onclick="confirmar('${c.id}')"><i class="ti ti-brand-whatsapp"></i> Confirmar</button>
           <button class="btn btn--perigo btn--pequeno" onclick="cancelar('${c.id}')"><i class="ti ti-x"></i></button>`
        : `<button class="btn btn--contorno btn--pequeno" onclick="reenviar('${c.id}')"><i class="ti ti-send"></i> Reenviar</button>`}
    </li>`).join('');
}

function confirmar(id) {
  const consultas = DB.ler('consultas');
  const c = consultas.find(x => x.id === id);
  c.status = 'confirmada';
  DB.salvar('consultas', consultas);
  listarConfirmacao();
  Util.aviso(`WhatsApp enviado para ${Util.nomePaciente(c.pacienteId)}: consulta confirmada!`);
}

function cancelar(id) {
  const consultas = DB.ler('consultas');
  const c = consultas.find(x => x.id === id);
  c.status = 'cancelada';
  DB.salvar('consultas', consultas);
  listarConfirmacao();
  Util.aviso('Consulta cancelada.', 'pendente');
}

function reenviar(id) {
  const c = DB.ler('consultas').find(x => x.id === id);
  Util.aviso(`Lembrete reenviado por SMS para ${Util.nomePaciente(c.pacienteId)}.`);
}

/* ---------- FUNÇÃO 2: faturamento ---------- */
function montarFiltroConvenio() {
  document.getElementById('fat-filtro').innerHTML =
    '<option value="">Todos os convênios</option>' + CONVENIOS.map(c => `<option>${c}</option>`).join('');
}

function listarFaturas() {
  const filtro = document.getElementById('fat-filtro').value;
  let faturas = DB.ler('faturas');
  const todas = faturas;
  if (filtro) faturas = faturas.filter(f => f.convenio === filtro);

  /* totais (sempre sobre todas as faturas) */
  const total = todas.reduce((s, f) => s + f.valor, 0);
  const recebido = todas.filter(f => f.status === 'paga').reduce((s, f) => s + f.valor, 0);
  const pendente = total - recebido;
  document.getElementById('fat-metricas').innerHTML = `
    <div class="metrica"><div class="rotulo">Total faturado</div><div class="valor">${Util.moeda(total)}</div></div>
    <div class="metrica"><div class="rotulo">Recebido</div><div class="valor" style="color:var(--cor-primaria)">${Util.moeda(recebido)}</div></div>
    <div class="metrica"><div class="rotulo">A receber</div><div class="valor" style="color:var(--status-pendente-texto)">${Util.moeda(pendente)}</div></div>`;

  const corpo = document.getElementById('lista-faturas');
  if (!faturas.length) { corpo.innerHTML = '<tr><td colspan="5" class="vazio">Nenhuma fatura.</td></tr>'; return; }
  corpo.innerHTML = faturas.map(f => `
    <tr>
      <td><strong>${Util.escape(Util.nomePaciente(f.pacienteId))}</strong></td>
      <td><span class="status status--info">${Util.escape(f.convenio)}</span></td>
      <td>${Util.moeda(f.valor)}</td>
      <td><span class="status status--${f.status === 'paga' ? 'ok' : 'pendente'}">${f.status}</span></td>
      <td style="text-align:right">${f.status === 'pendente'
        ? `<button class="btn btn--suave btn--pequeno" onclick="marcarPaga('${f.id}')"><i class="ti ti-cash"></i> Marcar paga</button>`
        : '<i class="ti ti-circle-check" style="color:var(--cor-primaria)"></i>'}</td>
    </tr>`).join('');
}

function marcarPaga(id) {
  const faturas = DB.ler('faturas');
  faturas.find(f => f.id === id).status = 'paga';
  DB.salvar('faturas', faturas);
  listarFaturas();
  Util.aviso('Fatura marcada como paga.');
}

/* ---------- FUNÇÃO 3: exportação ---------- */
function exportarCSV() {
  const linhas = DB.ler('faturas').map(f => [Util.nomePaciente(f.pacienteId), f.convenio, f.valor, f.status]);
  Util.baixarCSV('faturas-saudeintegra.csv', ['Paciente', 'Convênio', 'Valor (R$)', 'Status'], linhas);
  Util.aviso('Arquivo CSV gerado (abre no Excel).');
}