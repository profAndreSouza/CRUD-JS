/* ================================================================
   app.js — Controlador de interface (UI ↔ DB)
   ================================================================
   Responsável por:
     • Inicializar o banco ao carregar a página
     • Gerenciar navegação por abas
     • Capturar eventos de formulários e chamar DB.*
     • Renderizar tabelas dinamicamente
     • Exibir feedback (toast / mensagens de erro)
================================================================ */

// ── Utilitários ────────────────────────────────────────────────

/**
 * Exibe uma notificação toast na tela.
 * @param {string} msg   - Mensagem a exibir
 * @param {'success'|'error'|'info'} type
 */
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className   = `toast ${type}`;

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'toast hidden';
  }, 3500);
}

/**
 * Converte um array de objetos em uma <table> HTML.
 * @param {Object[]} rows  - Linhas retornadas por DB.query()
 * @param {string[]} [actionCols] - Nomes de colunas de ID para botões de ação
 * @returns {string} HTML da tabela
 */
function buildTable(rows, idCol = null) {
  if (!rows || rows.length === 0) {
    return `<p class="placeholder-msg">Nenhum registro encontrado.</p>`;
  }

  const cols = Object.keys(rows[0]);

  const thead = `<thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}${idCol ? '<th>Ações</th>' : ''}</tr></thead>`;

  const tbody = rows.map(row => {
    const cells = cols.map(c => `<td>${row[c] ?? ''}</td>`).join('');
    const actions = idCol
      ? `<td>
           <button class="action-btn delete"
             onclick="handleDelete('${idCol}', ${row[idCol]}, this)">🗑 Deletar</button>
         </td>`
      : '';
    return `<tr>${cells}${actions}</tr>`;
  }).join('');

  return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
}

/**
 * Renderiza o resultado de uma query no container indicado.
 * @param {string} containerId
 * @param {Object[]} rows
 * @param {string|null} idCol - coluna de chave para botões de ação
 */
function renderTable(containerId, rows, idCol = null) {
  document.getElementById(containerId).innerHTML = buildTable(rows, idCol);
}

// ── Mapa de deleção por entidade ───────────────────────────────
const deleteHandlers = {
  id_pessoa:      (id) => DB.Pessoa.deletar(id),
  id_estudante:   (id) => DB.Estudante.deletar(id),
  id_funcionario: (id) => DB.Funcionario.deletar(id),
  id_disciplina:  (id) => DB.Disciplina.deletar(id),
  id_md:          (id) => DB.MatriculaDisciplina.deletar(id),
  id_ministra:    (id) => DB.Ministra.deletar(id),
  id_orientacao:  (id) => DB.Orientacao.deletar(id),
};

/**
 * Handler global de deleção — chamado inline pelos botões da tabela.
 */
function handleDelete(idCol, id, btn) {
  if (!confirm(`Deseja deletar o registro com ${idCol} = ${id}?`)) return;
  try {
    deleteHandlers[idCol]?.(id);
    btn.closest('tr').remove();
    showToast('Registro deletado com sucesso.', 'success');
  } catch (err) {
    showToast(`Erro ao deletar: ${err.message}`, 'error');
  }
}

// ── Inicialização ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {

  const statusEl    = document.getElementById('db-status');
  const btnInit     = document.getElementById('btn-init-db');
  const btnClear    = document.getElementById('btn-clear-db');
  const btnExport   = document.getElementById('btn-export-db');

  // ── Carrega sql.js WASM e cria o banco ──────────────────────
  try {
    await DB.init();
    statusEl.textContent = '✅ Banco pronto (memória)';
    statusEl.className   = 'badge badge-success';
    btnInit.disabled     = false;
    btnClear.disabled    = false;
    btnExport.disabled   = false;
    showToast('Banco SQLite inicializado com sucesso!', 'success');
  } catch (err) {
    statusEl.textContent = '❌ Erro ao carregar banco';
    statusEl.className   = 'badge badge-danger';
    showToast(`Erro: ${err.message}`, 'error');
    console.error(err);
  }

  // ── Botão: reinicializar ─────────────────────────────────────
  btnInit.addEventListener('click', async () => {
    try {
      await DB.init();
      showToast('Banco reinicializado!', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── Botão: limpar banco ──────────────────────────────────────
  btnClear.addEventListener('click', async () => {
    if (!confirm('Isso apagará TODOS os dados em memória. Continuar?')) return;
    await DB.init();
    showToast('Banco limpo e reinicializado.', 'info');
  });

  // ── Botão: exportar .db ──────────────────────────────────────
  btnExport.addEventListener('click', () => {
    try {
      DB.exportDB();
      showToast('Arquivo universidade.db exportado!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── Navegação por abas ───────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // ── Console SQL ──────────────────────────────────────────────
  document.getElementById('btn-run-sql').addEventListener('click', () => {
    const sql     = document.getElementById('sql-input').value.trim();
    const box     = document.getElementById('sql-result-box');
    if (!sql) return;

    try {
      // Detecta SELECT vs DML
      if (/^\s*SELECT/i.test(sql)) {
        const rows = DB.query(sql);
        box.innerHTML = rows.length
          ? buildTable(rows)
          : `<p class="msg-success">Query executada — 0 linhas retornadas.</p>`;
      } else {
        const affected = DB.run(sql);
        box.innerHTML  = `<p class="msg-success">✅ Executado com sucesso. Linhas afetadas: ${affected}</p>`;
      }
    } catch (err) {
      box.innerHTML = `<p class="msg-error">❌ Erro SQL:\n${err.message}</p>`;
    }
  });

  document.getElementById('btn-clear-console').addEventListener('click', () => {
    document.getElementById('sql-input').value     = '';
    document.getElementById('sql-result-box').innerHTML =
      `<p class="placeholder-msg">Os resultados aparecerão aqui.</p>`;
  });

  // ════════════════════════════════════════════════════════════
  // FORMULÁRIOS
  // ════════════════════════════════════════════════════════════

  // ── PESSOA ───────────────────────────────────────────────────
  document.getElementById('form-pessoa').addEventListener('submit', e => {
    e.preventDefault();
    try {
      DB.Pessoa.inserir({
        nome:        document.getElementById('p-nome').value,
        documento:   document.getElementById('p-documento').value,
        logradouro:  document.getElementById('p-logradouro').value,
        numero:      document.getElementById('p-numero').value,
        complemento: document.getElementById('p-complemento').value,
        bairro:      document.getElementById('p-bairro').value,
        cidade:      document.getElementById('p-cidade').value,
        estado:      document.getElementById('p-estado').value,
        cep:         document.getElementById('p-cep').value,
      });
      e.target.reset();
      showToast('Pessoa inserida com sucesso!', 'success');
      renderTable('table-pessoa', DB.Pessoa.listarTodos(), 'id_pessoa');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });

  document.getElementById('btn-list-pessoa').addEventListener('click', () => {
    try {
      renderTable('table-pessoa', DB.Pessoa.listarTodos(), 'id_pessoa');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── ESTUDANTE ────────────────────────────────────────────────
  document.getElementById('form-estudante').addEventListener('submit', e => {
    e.preventDefault();
    try {
      DB.Estudante.inserir({
        id_pessoa:     parseInt(document.getElementById('e-pessoa-id').value),
        num_matricula: document.getElementById('e-matricula').value,
        curso:         document.getElementById('e-curso').value,
      });
      e.target.reset();
      showToast('Estudante inserido com sucesso!', 'success');
      renderTable('table-estudante', DB.Estudante.listarTodos(), 'id_estudante');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });

  document.getElementById('btn-list-estudante').addEventListener('click', () => {
    try {
      renderTable('table-estudante', DB.Estudante.listarTodos(), 'id_estudante');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── FUNCIONÁRIO ──────────────────────────────────────────────
  document.getElementById('form-funcionario').addEventListener('submit', e => {
    e.preventDefault();
    try {
      DB.Funcionario.inserir({
        id_pessoa:            parseInt(document.getElementById('f-pessoa-id').value),
        registro_funcional:   document.getElementById('f-registro').value,
        data_admissao:        document.getElementById('f-admissao').value,
        setor:                document.getElementById('f-setor').value,
      });
      e.target.reset();
      showToast('Funcionário inserido com sucesso!', 'success');
      renderTable('table-funcionario', DB.Funcionario.listarTodos(), 'id_funcionario');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });

  document.getElementById('btn-list-funcionario').addEventListener('click', () => {
    try {
      renderTable('table-funcionario', DB.Funcionario.listarTodos(), 'id_funcionario');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── DISCIPLINA ───────────────────────────────────────────────
  document.getElementById('form-disciplina').addEventListener('submit', e => {
    e.preventDefault();
    try {
      DB.Disciplina.inserir({
        codigo:        document.getElementById('d-codigo').value,
        nome:          document.getElementById('d-nome').value,
        carga_horaria: parseInt(document.getElementById('d-ch').value),
      });
      e.target.reset();
      showToast('Disciplina inserida com sucesso!', 'success');
      renderTable('table-disciplina', DB.Disciplina.listarTodas(), 'id_disciplina');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });

  document.getElementById('btn-list-disciplina').addEventListener('click', () => {
    try {
      renderTable('table-disciplina', DB.Disciplina.listarTodas(), 'id_disciplina');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── MATRÍCULA EM DISCIPLINA ──────────────────────────────────
  document.getElementById('form-matricula').addEventListener('submit', e => {
    e.preventDefault();
    try {
      const nota = document.getElementById('m-nota').value;
      DB.MatriculaDisciplina.inserir({
        id_estudante:  parseInt(document.getElementById('m-estudante-id').value),
        id_disciplina: parseInt(document.getElementById('m-disciplina-id').value),
        semestre:      parseInt(document.getElementById('m-semestre').value),
        ano:           parseInt(document.getElementById('m-ano').value),
        nota_final:    nota !== '' ? parseFloat(nota) : null,
      });
      e.target.reset();
      showToast('Matrícula em disciplina inserida!', 'success');
      renderTable('table-matricula', DB.MatriculaDisciplina.listarTodas(), 'id_md');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });

  document.getElementById('btn-list-matricula').addEventListener('click', () => {
    try {
      renderTable('table-matricula', DB.MatriculaDisciplina.listarTodas(), 'id_md');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── MINISTRA ─────────────────────────────────────────────────
  document.getElementById('form-ministra').addEventListener('submit', e => {
    e.preventDefault();
    try {
      DB.Ministra.inserir({
        id_funcionario: parseInt(document.getElementById('mn-funcionario-id').value),
        id_disciplina:  parseInt(document.getElementById('mn-disciplina-id').value),
      });
      e.target.reset();
      showToast('Atribuição inserida!', 'success');
      renderTable('table-ministra', DB.Ministra.listarTodas(), 'id_ministra');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });

  document.getElementById('btn-list-ministra').addEventListener('click', () => {
    try {
      renderTable('table-ministra', DB.Ministra.listarTodas(), 'id_ministra');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── ORIENTAÇÃO ───────────────────────────────────────────────
  document.getElementById('form-orientacao').addEventListener('submit', e => {
    e.preventDefault();
    try {
      DB.Orientacao.inserir({
        id_funcionario: parseInt(document.getElementById('o-orientador-id').value),
        id_estudante:   parseInt(document.getElementById('o-orientado-id').value),
      });
      e.target.reset();
      showToast('Orientação registrada!', 'success');
      renderTable('table-orientacao', DB.Orientacao.listarTodas(), 'id_orientacao');
    } catch (err) {
      showToast(`Erro: ${err.message}`, 'error');
    }
  });

  document.getElementById('btn-list-orientacao').addEventListener('click', () => {
    try {
      renderTable('table-orientacao', DB.Orientacao.listarTodas(), 'id_orientacao');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

}); // fim DOMContentLoaded

