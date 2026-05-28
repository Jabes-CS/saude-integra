/* =====================================================================
   Tela 2 — Agenda (Thiago)
   Funções: agenda de consultas, laboratórios/exames, relatório, IA (demo)
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  preencherPacientes('ag-paciente');
  preencherPacientes('ex-paciente');
  encherSel('ag-prof', PROFISSIONAIS);
  encherSel('ag-sala', DB.ler('salas').filter(s => s.tipo === 'sala').map(s => s.nome));
  document.getElementById('ag-data').value = new Date().toISOString().slice(0, 10);
  montarFiltro();
  listarConsultas();
  listarExames();
});

function encherSel(id, itens) { document.getElementById(id).innerHTML = itens.map(i => `<option>${i}</option>`).join(''); }
function preencherPacientes(id) {
  document.getElementById(id).innerHTML = DB.ler('pacientes').map(p => `<option value="${p.id}">${Util.escape(p.nome)}</option>`).join('');
}

/* ---------- FUNÇÃO 1: agenda ---------- */
function montarFiltro() {
  document.getElementById('ag-filtro').innerHTML =
    '<option value="">Todos os profissionais</option>' + PROFISSIONAIS.map(p => `<option>${p}</option>`).join('');
}

function agendar() {
  const pacienteId = document.getElementById('ag-paciente').value;
  if (!pacienteId) { Util.aviso('Cadastre um paciente na Tela 1 primeiro.', 'pendente'); return; }
  const consultas = DB.ler('consultas');
  consultas.push({
    id: DB.novoId(), pacienteId,
    profissional: document.getElementById('ag-prof').value,
    sala: document.getElementById('ag-sala').value,
    data: document.getElementById('ag-data').value,
    hora: document.getElementById('ag-hora').value,
    status: 'pendente'
  });
  DB.salvar('consultas', consultas);
  listarConsultas();
  Util.aviso('Consulta marcada! (aguardando confirmação na Tela 3)');
}

function listarConsultas() {
  const filtro = document.getElementById('ag-filtro').value;
  let consultas = DB.ler('consultas').sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
  if (filtro) consultas = consultas.filter(c => c.profissional === filtro);
  const corpo = document.getElementById('lista-consultas');
  if (!consultas.length) { corpo.innerHTML = '<tr><td colspan="5" class="vazio">Nenhuma consulta.</td></tr>'; return; }
  const cls = { confirmada: 'ok', pendente: 'pendente', cancelada: 'erro' };
  corpo.innerHTML = consultas.map(c => `
    <tr>
      <td><strong>${Util.escape(Util.nomePaciente(c.pacienteId))}</strong></td>
      <td>${Util.escape(c.profissional)}</td>
      <td>${Util.escape(c.sala)}</td>
      <td>${Util.dataBR(c.data)} · ${c.hora}</td>
      <td><span class="status status--${cls[c.status]}">${c.status}</span></td>
    </tr>`).join('');
}

/* ---------- FUNÇÃO 2: exames ---------- */
function solicitarExame() {
  const pacienteId = document.getElementById('ex-paciente').value;
  const tipo = document.getElementById('ex-tipo').value.trim();
  if (!pacienteId || !tipo) { Util.aviso('Escolha o paciente e o tipo de exame.', 'pendente'); return; }
  const exames = DB.ler('exames');
  exames.push({ id: DB.novoId(), pacienteId, tipo, lab: 'Lab. Central', status: 'aguardando', data: new Date().toISOString().slice(0, 10) });
  DB.salvar('exames', exames);
  document.getElementById('ex-tipo').value = '';
  listarExames();
  Util.aviso('Exame solicitado ao laboratório.');
}

function listarExames() {
  const exames = DB.ler('exames');
  const ul = document.getElementById('lista-exames');
  if (!exames.length) { ul.innerHTML = '<li class="vazio">Nenhum exame.</li>'; return; }
  ul.innerHTML = exames.map(e => `
    <li class="item">
      <i class="ti ti-flask-2" style="font-size:20px;color:var(--cor-apoio)"></i>
      <div class="item__principal">
        <strong>${Util.escape(e.tipo)}</strong>
        <span>${Util.escape(Util.nomePaciente(e.pacienteId))} · ${Util.escape(e.lab)}</span>
      </div>
      <span class="status status--${e.status === 'pronto' ? 'ok' : 'pendente'}">${e.status === 'pronto' ? 'pronto' : 'aguardando'}</span>
    </li>`).join('');
}

/* ---------- FUNÇÃO 3: relatório do dia ---------- */
function gerarRelatorio() {
  const hoje = new Date().toISOString().slice(0, 10);
  const doDia = DB.ler('consultas').filter(c => c.data === hoje && c.status !== 'cancelada')
    .sort((a, b) => a.hora.localeCompare(b.hora));
  const div = document.getElementById('relatorio');
  if (!doDia.length) { div.innerHTML = '<p class="vazio">Nenhuma consulta para hoje.</p>'; return; }
  div.innerHTML = `
    <table class="tabela">
      <thead><tr><th>Hora</th><th>Paciente</th><th>Profissional</th><th>Sala</th></tr></thead>
      <tbody>${doDia.map(c => `<tr><td>${c.hora}</td><td>${Util.escape(Util.nomePaciente(c.pacienteId))}</td><td>${Util.escape(c.profissional)}</td><td>${Util.escape(c.sala)}</td></tr>`).join('')}</tbody>
    </table>`;
  Util.aviso(`Relatório gerado: ${doDia.length} paciente(s) hoje.`);
}

/* ---------- FUNÇÃO 4: IA (simulação) ---------- */
function simularIA() {
  const txt = document.getElementById('ia-sintomas').value.toLowerCase();
  let hipotese = 'Quadro inespecífico — recomenda-se avaliação clínica presencial.';
  if (txt.includes('febre')) hipotese = 'Possível quadro infeccioso (viral). Sugestão: hidratação, repouso e reavaliação em 48h.';
  if (txt.includes('tosse') && txt.includes('falta de ar')) hipotese = 'Possível quadro respiratório. Sugestão: ausculta pulmonar e oximetria.';
  document.getElementById('ia-resultado').innerHTML =
    `<div class="status status--info" style="display:block;padding:14px"><strong><i class="ti ti-sparkles"></i> Sugestão simulada:</strong><br>${hipotese}</div>`;
}