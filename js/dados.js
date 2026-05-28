/* =====================================================================
   SaúdeIntegra — Camada de dados (compartilhada por TODAS as telas)
   ---------------------------------------------------------------------
   Tudo é guardado no localStorage (a "memória" do navegador). Assim os
   dados são os mesmos em todas as telas e continuam salvos quando você
   recarrega ou troca de página. Não precisa de servidor nem banco real.

   Como usar nas telas:
     DB.ler('pacientes')          -> devolve a lista de pacientes
     DB.salvar('pacientes', lista)-> guarda a lista
     DB.novoId()                  -> cria um código único
     DB.resetar()                 -> apaga tudo e recria os dados de exemplo
   ===================================================================== */

const DB = {
  ler(chave, padrao = []) {
    const bruto = localStorage.getItem('si_' + chave);
    return bruto ? JSON.parse(bruto) : padrao;
  },
  salvar(chave, valor) {
    localStorage.setItem('si_' + chave, JSON.stringify(valor));
  },
  novoId() {
    return 'id' + Date.now() + Math.floor(Math.random() * 1000);
  },
  resetar() {
    Object.keys(localStorage).filter(k => k.startsWith('si_')).forEach(k => localStorage.removeItem(k));
    semear(true);
  }
};

/* listas fixas usadas em vários menus */
const PROFISSIONAIS = ['Dr. Almeida — Clínico Geral', 'Dra. Costa — Cardiologia', 'Dr. Nunes — Fisioterapia', 'Dra. Lima — Psicologia'];
const EQUIPE        = ['Jefté', 'Thiago', 'Jabes', 'Lucas', 'Richard'];
const CONVENIOS     = ['SUS', 'Unimed', 'Bradesco Saúde', 'Amil', 'Particular'];

/* data de hoje no formato AAAA-MM-DD (para a "lista de pacientes do dia") */
function hoje() { return new Date().toISOString().slice(0, 10); }

/* cria os dados de exemplo só na primeira vez (ou quando resetar) */
function semear(forcar = false) {
  if (!forcar && localStorage.getItem('si_iniciado')) return;
  const HOJE = hoje();

  DB.salvar('pacientes', [
    { id: 'p1', nome: 'Maria Santos',  nasc: '1988-03-12', tel: '(19) 99876-5432', email: 'maria.santos@email.com', convenio: 'Unimed',         historico: 'Hipertensão controlada. Alergia a dipirona.' },
    { id: 'p2', nome: 'João Oliveira', nasc: '1975-11-02', tel: '(19) 99654-1122', email: 'joao.oliveira@email.com', convenio: 'SUS',            historico: 'Diabetes tipo 2. Acompanhamento trimestral.' },
    { id: 'p3', nome: 'Ana Pereira',   nasc: '1996-07-25', tel: '(19) 99123-4488', email: 'ana.pereira@email.com',  convenio: 'Bradesco Saúde',  historico: 'Sem comorbidades. Consulta de rotina.' },
    { id: 'p4', nome: 'Carlos Souza',  nasc: '1962-01-30', tel: '(19) 99777-9090', email: 'carlos.souza@email.com', convenio: 'Particular',      historico: 'Pós-operatório de joelho. Fisioterapia em andamento.' },
    { id: 'p5', nome: 'Beatriz Lima',  nasc: '2001-09-18', tel: '(19) 99445-6677', email: 'beatriz.lima@email.com', convenio: 'Amil',            historico: 'Acompanhamento psicológico semanal.' }
  ]);

  DB.salvar('consultas', [
    { id: 'c1', pacienteId: 'p1', profissional: PROFISSIONAIS[0], sala: 'Consultório 1', data: HOJE, hora: '09:00', status: 'confirmada' },
    { id: 'c2', pacienteId: 'p2', profissional: PROFISSIONAIS[1], sala: 'Consultório 2', data: HOJE, hora: '10:30', status: 'pendente'   },
    { id: 'c3', pacienteId: 'p4', profissional: PROFISSIONAIS[2], sala: 'Sala de Terapia', data: HOJE, hora: '14:00', status: 'confirmada' },
    { id: 'c4', pacienteId: 'p5', profissional: PROFISSIONAIS[3], sala: 'Consultório 1', data: HOJE, hora: '16:30', status: 'pendente'   },
    { id: 'c5', pacienteId: 'p3', profissional: PROFISSIONAIS[0], sala: 'Consultório 2', data: '2026-06-02', hora: '11:00', status: 'cancelada' }
  ]);

  DB.salvar('exames', [
    { id: 'e1', pacienteId: 'p1', tipo: 'Hemograma completo', lab: 'Lab. Vida',    status: 'pronto',     data: HOJE },
    { id: 'e2', pacienteId: 'p2', tipo: 'Glicemia em jejum',  lab: 'Lab. Central', status: 'pronto',     data: HOJE },
    { id: 'e3', pacienteId: 'p4', tipo: 'Raio-X joelho',      lab: 'ImagemSul',    status: 'aguardando', data: HOJE }
  ]);

  DB.salvar('atendimentos', [
    { id: 'a1', pacienteId: 'p4', data: HOJE, anotacao: 'Paciente relata melhora na amplitude de movimento. Manter exercícios.' },
    { id: 'a2', pacienteId: 'p1', data: HOJE, anotacao: 'Pressão 12x8. Renovada receita de losartana.' }
  ]);

  DB.salvar('faturas', [
    { id: 'f1', pacienteId: 'p1', convenio: 'Unimed',        valor: 180, status: 'paga'     },
    { id: 'f2', pacienteId: 'p2', convenio: 'SUS',           valor: 0,   status: 'paga'     },
    { id: 'f3', pacienteId: 'p4', convenio: 'Particular',    valor: 250, status: 'pendente' },
    { id: 'f4', pacienteId: 'p5', convenio: 'Amil',          valor: 200, status: 'pendente' }
  ]);

  DB.salvar('notificacoes', [
    { id: 'n1', texto: 'Exame de Maria Santos ficou pronto.', lida: false, data: HOJE },
    { id: 'n2', texto: 'Reunião de equipe às 17h.',           lida: false, data: HOJE },
    { id: 'n3', texto: 'Consulta de João Oliveira ainda pendente de confirmação.', lida: true, data: HOJE }
  ]);

  DB.salvar('observacoes', [
    { id: 'o1', autor: 'Richard', texto: 'Manutenção do ar-condicionado do Consultório 1 agendada para sexta.', data: HOJE }
  ]);

  DB.salvar('financeiro', [
    { id: 't1', descricao: 'Repasse convênio Unimed', tipo: 'entrada', valor: 180,  data: HOJE },
    { id: 't2', descricao: 'Pagamento fornecedor (material)', tipo: 'saida', valor: 90, data: HOJE },
    { id: 't3', descricao: 'Consulta particular — Carlos Souza', tipo: 'entrada', valor: 250, data: HOJE }
  ]);

  DB.salvar('salas', [
    { id: 's1', nome: 'Consultório 1',   tipo: 'sala',          disponivel: true  },
    { id: 's2', nome: 'Consultório 2',   tipo: 'sala',          disponivel: true  },
    { id: 's3', nome: 'Sala de Terapia', tipo: 'sala',          disponivel: false },
    { id: 's4', nome: 'Dr. Almeida',     tipo: 'profissional',  disponivel: true  },
    { id: 's5', nome: 'Dra. Lima',       tipo: 'profissional',  disponivel: false }
  ]);

  /* checklist do prontuário (Tela 1) — tarefas por paciente */
  DB.salvar('tarefas', [
    { id: 'tar1', pacienteId: 'p1', texto: 'Solicitar exame de rotina', responsavel: 'Dra. Costa', feito: true  },
    { id: 'tar2', pacienteId: 'p1', texto: 'Agendar retorno em 30 dias', responsavel: 'Jefté',      feito: false },
    { id: 'tar3', pacienteId: 'p4', texto: 'Avaliar evolução fisioterapia', responsavel: 'Dr. Nunes', feito: false }
  ]);

  localStorage.setItem('si_iniciado', 'sim');
}

/* roda assim que o arquivo é carregado */
semear();