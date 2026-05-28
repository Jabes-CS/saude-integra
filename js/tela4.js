/* =====================================================================
   Tela 4 — Atendimentos (Lucas)
   Funções: registro de atendimentos, linha do cuidado, notificações, BI (demo)
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  preencherPacientes('at-paciente');
  preencherPacientes('lc-paciente');
  listarAtendimentos();
  montarLinhaCuidado();
  listarNotificacoes();
  montarBI();
});

function preencherPacientes(id) {
  document.getElementById(id).innerHTML = DB.ler('pacientes').map(p => `<option value="${p.id}">${Util.escape(p.nome)}</option>`).join('');
}

/* ---------- FUNÇÃO 1: registro de atendimentos ---------- */
function registrarAtendimento() {
  const pacienteId = document.getElementById('at-paciente').value;
  const texto = document.getElementById('at-texto').value.trim();
  if (!pacienteId || !texto) { Util.aviso('Escolha o paciente e escreva a anotação.', 'pendente'); return; }
  const atendimentos = DB.ler('atendimentos');
  atendimentos.push({ id: DB.novoId(), pacienteId, data: new Date().toISOString().slice(0, 10), anotacao: texto });
  DB.salvar('atendimentos', atendimentos);
  document.getElementById('at-texto').value = '';
  listarAtendimentos();
  montarLinhaCuidado();
  Util.aviso('Atendimento registrado.');
}

function listarAtendimentos() {
  const atendimentos = DB.ler('atendimentos').slice().reverse();
  const ul = document.getElementById('lista-atendimentos');
  if (!atendimentos.length) { ul.innerHTML = '<li class="vazio">Nenhum atendimento registrado.</li>'; return; }
  ul.innerHTML = atendimentos.map(a => `
    <li class="item">
      <i class="ti ti-file-text" style="font-size:20px;color:var(--cor-apoio)"></i>
      <div class="item__principal">
        <strong>${Util.escape(Util.nomePaciente(a.pacienteId))}</strong>
        <span>${Util.escape(a.anotacao)} · ${Util.dataBR(a.data)}</span>
      </div>
    </li>`).join('');
}

/* ---------- FUNÇÃO 2: linha do cuidado (junta tudo do paciente) ---------- */
function montarLinhaCuidado() {
  const id = document.getElementById('lc-paciente').value;
  const eventos = [];
  DB.ler('consultas').filter(c => c.pacienteId === id).forEach(c =>
    eventos.push({ data: c.data, icone: 'ti-calendar', texto: `Consulta com ${c.profissional} (${c.status})` }));
  DB.ler('exames').filter(e => e.pacienteId === id).forEach(e =>
    eventos.push({ data: e.data, icone: 'ti-flask', texto: `Exame: ${e.tipo} — ${e.status}` }));
  DB.ler('atendimentos').filter(a => a.pacienteId === id).forEach(a =>
    eventos.push({ data: a.data, icone: 'ti-notes', texto: a.anotacao }));
  eventos.sort((a, b) => b.data.localeCompare(a.data));

  const ul = document.getElementById('linha-cuidado');
  if (!eventos.length) { ul.innerHTML = '<li class="vazio">Sem eventos para este paciente.</li>'; return; }
  ul.innerHTML = eventos.map(e => `
    <li>
      <strong><i class="ti ${e.icone}" style="color:var(--cor-primaria);vertical-align:-2px"></i> ${Util.dataBR(e.data)}</strong><br>
      <span style="color:var(--cor-texto-suave);font-size:14px">${Util.escape(e.texto)}</span>
    </li>`).join('');
}

/* ---------- FUNÇÃO 3: notificações internas ---------- */
function enviarNotificacao() {
  const texto = document.getElementById('not-texto').value.trim();
  if (!texto) { Util.aviso('Escreva o aviso.', 'pendente'); return; }
  const notas = DB.ler('notificacoes');
  notas.unshift({ id: DB.novoId(), texto, lida: false, data: new Date().toISOString().slice(0, 10) });
  DB.salvar('notificacoes', notas);
  document.getElementById('not-texto').value = '';
  listarNotificacoes();
  Util.aviso('Aviso publicado para a equipe.');
}

function listarNotificacoes() {
  const notas = DB.ler('notificacoes');
  const ul = document.getElementById('lista-notificacoes');
  if (!notas.length) { ul.innerHTML = '<li class="vazio">Nenhuma notificação.</li>'; return; }
  ul.innerHTML = notas.map(n => `
    <li class="item" style="${n.lida ? 'opacity:.6' : ''}">
      <i class="ti ti-${n.lida ? 'mail-opened' : 'mail'}" style="font-size:20px;color:var(--cor-apoio)"></i>
      <div class="item__principal"><strong>${Util.escape(n.texto)}</strong><span>${Util.dataBR(n.data)}</span></div>
      ${n.lida ? '<span class="status status--info">lida</span>' : `<button class="btn btn--contorno btn--pequeno" onclick="marcarLida('${n.id}')"><i class="ti ti-check"></i> Marcar lida</button>`}
    </li>`).join('');
}

function marcarLida(id) {
  const notas = DB.ler('notificacoes');
  notas.find(n => n.id === id).lida = true;
  DB.salvar('notificacoes', notas);
  listarNotificacoes();
}

/* ---------- FUNÇÃO 4: BI (gráfico simulado em CSS) ---------- */
function montarBI() {
  const dados = [
    { doenca: 'Hipertensão', risco: 62 },
    { doenca: 'Diabetes', risco: 48 },
    { doenca: 'Obesidade', risco: 35 },
    { doenca: 'Ansiedade', risco: 27 }
  ];
  document.getElementById('bi-grafico').innerHTML = dados.map(d => `
    <div style="margin-bottom:12px">
      <div class="linha entre" style="font-size:13px;margin-bottom:4px"><span>${d.doenca}</span><strong>${d.risco}%</strong></div>
      <div style="height:10px;background:var(--cor-fundo);border-radius:6px;overflow:hidden">
        <div style="height:100%;width:${d.risco}%;background:var(--cor-primaria);border-radius:6px"></div>
      </div>
    </div>`).join('');
}