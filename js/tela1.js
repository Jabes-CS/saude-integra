/* =====================================================================
   Tela 1 — Pacientes (Jefté)
   Funções: cadastro de pacientes, prontuário/checklist, temas, IoT (demo)
   ===================================================================== */

/* preenche os menus suspensos (convênios, equipe, pacientes, temas) ao abrir */
document.addEventListener('DOMContentLoaded', () => {
  encher('p-convenio', CONVENIOS);
  encher('tar-resp', [...PROFISSIONAIS.map(p => p.split(' — ')[0]), ...EQUIPE]);
  listarPacientes();
  encherPacientesProntuario();
  abrirProntuario();
  montarTemas();
});

function encher(id, itens) {
  document.getElementById(id).innerHTML = itens.map(i => `<option>${i}</option>`).join('');
}

/* ---------- FUNÇÃO 1: cadastro ---------- */
function cadastrarPaciente() {
  const nome = document.getElementById('p-nome').value.trim();
  if (!nome) { Util.aviso('Informe o nome do paciente.', 'pendente'); return; }
  const pacientes = DB.ler('pacientes');
  pacientes.push({
    id: DB.novoId(),
    nome,
    nasc: document.getElementById('p-nasc').value || '2000-01-01',
    tel: document.getElementById('p-tel').value || '—',
    email: document.getElementById('p-email').value || '—',
    convenio: document.getElementById('p-convenio').value,
    historico: document.getElementById('p-hist').value || 'Sem observações.'
  });
  DB.salvar('pacientes', pacientes);
  ['p-nome','p-nasc','p-tel','p-email','p-hist'].forEach(i => document.getElementById(i).value = '');
  listarPacientes();
  encherPacientesProntuario();
  Util.aviso('Paciente cadastrado com sucesso!');
}

function listarPacientes() {
  const pacientes = DB.ler('pacientes');
  const corpo = document.getElementById('lista-pacientes');
  if (!pacientes.length) { corpo.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum paciente cadastrado.</td></tr>'; return; }
  corpo.innerHTML = pacientes.map(p => `
    <tr>
      <td><strong>${Util.escape(p.nome)}</strong></td>
      <td>${Util.idade(p.nasc)} anos</td>
      <td>${Util.escape(p.tel)}</td>
      <td><span class="status status--info">${Util.escape(p.convenio)}</span></td>
      <td style="text-align:right"><button class="btn btn--perigo btn--pequeno" onclick="removerPaciente('${p.id}')"><i class="ti ti-trash"></i></button></td>
    </tr>`).join('');
}

function removerPaciente(id) {
  DB.salvar('pacientes', DB.ler('pacientes').filter(p => p.id !== id));
  DB.salvar('tarefas', DB.ler('tarefas').filter(t => t.pacienteId !== id));
  listarPacientes();
  encherPacientesProntuario();
  abrirProntuario();
  Util.aviso('Paciente removido.', 'pendente');
}

/* ---------- FUNÇÃO 2: prontuário / checklist ---------- */
function encherPacientesProntuario() {
  const sel = document.getElementById('pront-paciente');
  const anterior = sel.value;
  const pacientes = DB.ler('pacientes');
  sel.innerHTML = pacientes.map(p => `<option value="${p.id}">${Util.escape(p.nome)}</option>`).join('');
  if (anterior) sel.value = anterior;
}

function abrirProntuario() {
  const id = document.getElementById('pront-paciente').value;
  const p = DB.ler('pacientes').find(x => x.id === id);
  const hist = document.getElementById('pront-historico');
  if (!p) { hist.textContent = 'Selecione um paciente.'; document.getElementById('lista-tarefas').innerHTML = ''; return; }
  hist.innerHTML = `<i class="ti ti-notes"></i> Histórico: ${Util.escape(p.historico)}`;
  listarTarefas(id);
}

function adicionarTarefa() {
  const id = document.getElementById('pront-paciente').value;
  const texto = document.getElementById('tar-texto').value.trim();
  if (!id) { Util.aviso('Cadastre/selecione um paciente primeiro.', 'pendente'); return; }
  if (!texto) { Util.aviso('Escreva a tarefa.', 'pendente'); return; }
  const tarefas = DB.ler('tarefas');
  tarefas.push({ id: DB.novoId(), pacienteId: id, texto, responsavel: document.getElementById('tar-resp').value, feito: false });
  DB.salvar('tarefas', tarefas);
  document.getElementById('tar-texto').value = '';
  listarTarefas(id);
  Util.aviso('Tarefa adicionada ao prontuário.');
}

function listarTarefas(pacienteId) {
  const tarefas = DB.ler('tarefas').filter(t => t.pacienteId === pacienteId);
  const ul = document.getElementById('lista-tarefas');
  if (!tarefas.length) { ul.innerHTML = '<li class="vazio">Nenhuma tarefa neste prontuário.</li>'; return; }
  ul.innerHTML = tarefas.map(t => `
    <li class="item">
      <input type="checkbox" class="check" ${t.feito ? 'checked' : ''} onchange="alternarTarefa('${t.id}')">
      <div class="item__principal">
        <strong class="${t.feito ? 'feito' : ''}">${Util.escape(t.texto)}</strong>
        <span><i class="ti ti-user" style="vertical-align:-2px"></i> ${Util.escape(t.responsavel)}</span>
      </div>
      <button class="btn btn--perigo btn--pequeno" onclick="removerTarefa('${t.id}')"><i class="ti ti-x"></i></button>
    </li>`).join('');
}

function alternarTarefa(id) {
  const tarefas = DB.ler('tarefas');
  const t = tarefas.find(x => x.id === id);
  t.feito = !t.feito;
  DB.salvar('tarefas', tarefas);
  listarTarefas(t.pacienteId);
}

function removerTarefa(id) {
  const tarefas = DB.ler('tarefas');
  const t = tarefas.find(x => x.id === id);
  DB.salvar('tarefas', tarefas.filter(x => x.id !== id));
  listarTarefas(t.pacienteId);
}

/* ---------- FUNÇÃO 3: temas ---------- */
function montarTemas() {
  const cont = document.getElementById('lista-temas');
  cont.innerHTML = Tema.lista.map(t => {
    const ativo = Tema.atual() === t.id;
    return `<button class="metrica" style="cursor:pointer;text-align:left;border-color:${ativo ? 'var(--cor-primaria)' : 'var(--cor-borda)'}" onclick="escolherTema('${t.id}')">
      <div class="rotulo">${ativo ? '<i class="ti ti-circle-check" style="color:var(--cor-primaria)"></i> ' : ''}Tema</div>
      <div class="valor" style="font-size:18px">${t.nome}</div>
    </button>`;
  }).join('');
}

function escolherTema(id) {
  Tema.aplicar(id);
  montarTemas();
  Util.aviso('Tema aplicado: ' + Tema.lista.find(t => t.id === id).nome);
}