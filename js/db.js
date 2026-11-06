/* ================================================================
   db.js — Camada de acesso ao banco SQLite (sql.js / WASM)
   ================================================================
   OBJETIVO DIDÁTICO
   -----------------
   Este arquivo expõe o objeto global `DB` com:
     • DB.init()       → inicializa o engine WASM e cria as tabelas (DDL)
     • DB.run(sql, p)  → executa INSERT / UPDATE / DELETE (DML)
     • DB.query(sql,p) → executa SELECT e retorna array de objetos (DQL)
     • DB.export()     → serializa o banco para download (.db)

   FLUXO DE INICIALIZAÇÃO
   ----------------------
   1. O browser faz o download do sql-wasm.wasm via CDN.
   2. initSqlJs() compila o WASM e devolve a classe SQL.
   3. `new SQL.Database()` cria um banco em memória (RAM).
   4. DB.run() executa os DDL gerados pela turma.

   ⚠️  Banco em memória: os dados são perdidos ao recarregar a página.
       Use DB.export() para salvar um arquivo binário .db.
================================================================ */

const DB = (() => {

  // ── Estado interno ────────────────────────────────────────────
  let _db   = null;   // instância do Database (sql.js)
  let _SQL  = null;   // classe SQL carregada pelo WASM

  // ─────────────────────────────────────────────────────────────
  // DDL — CREATE TABLE
  // Os scripts abaixo serão construídos COM A TURMA durante a aula.
  // Deixe os blocos em branco e preencha progressivamente.
  // ─────────────────────────────────────────────────────────────
  const DDL = `

    /* ── Colado aqui o script DDL construído em aula ── */

  `;

  // ─────────────────────────────────────────────────────────────
  // init() — carrega o WASM e executa o DDL
  // ─────────────────────────────────────────────────────────────
  async function init() {
    _SQL = await initSqlJs({
      // Localização do arquivo .wasm — pode ser CDN ou local
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
    });

    _db = new _SQL.Database();   // banco em memória

    if (DDL.trim()) {
      _db.run(DDL);              // executa o DDL da turma
    }

    return _db;
  }

  // ─────────────────────────────────────────────────────────────
  // run(sql, params) — DML: INSERT / UPDATE / DELETE
  //   params: array de valores posicionais  ['João', 30]
  //           ou objeto de named params     { $nome: 'João' }
  // ─────────────────────────────────────────────────────────────
  function run(sql, params = []) {
    if (!_db) throw new Error('Banco não inicializado. Chame DB.init() primeiro.');
    _db.run(sql, params);
    return _db.getRowsModified();   // nº de linhas afetadas
  }

  // ─────────────────────────────────────────────────────────────
  // query(sql, params) — DQL: SELECT
  //   Retorna: Array de objetos  [{ col1: val, col2: val }, …]
  // ─────────────────────────────────────────────────────────────
  function query(sql, params = []) {
    if (!_db) throw new Error('Banco não inicializado. Chame DB.init() primeiro.');

    const stmt    = _db.prepare(sql);
    const results = [];

    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
  }

  // ─────────────────────────────────────────────────────────────
  // exportDB() — serializa o banco binário para download
  // ─────────────────────────────────────────────────────────────
  function exportDB() {
    if (!_db) throw new Error('Banco não inicializado.');

    const data = _db.export();              // Uint8Array
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href     = url;
    a.download = 'universidade.db';
    a.click();

    URL.revokeObjectURL(url);
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers de acesso rápido por entidade
  // (os métodos abaixo chamam run() e query() com SQLs fixos;
  //  durante a aula substitua pelos SQLs construídos pela turma)
  // ─────────────────────────────────────────────────────────────

  // ── Pessoa ────────────────────────────────────────────────────
  const Pessoa = {
    inserir(dados) {
      /* DML - INSERT INTO Pessoa  — construído em aula */
      const sql = `
        INSERT INTO Pessoa
          (nome, documento, logradouro, numero, complemento, bairro, cidade, estado, cep)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      return run(sql, [
        dados.nome, dados.documento,
        dados.logradouro, dados.numero, dados.complemento,
        dados.bairro, dados.cidade, dados.estado, dados.cep
      ]);
    },

    listarTodos() {
      /* DQL - SELECT  — construído em aula */
      return query(`SELECT * FROM Pessoa ORDER BY nome`);
    },

    buscarPorId(id) {
      return query(`SELECT * FROM Pessoa WHERE id_pessoa = ?`, [id]);
    },

    atualizar(id, dados) {
      /* DML - UPDATE  — construído em aula */
      const sql = `
        UPDATE Pessoa SET
          nome=?, documento=?, logradouro=?, numero=?,
          complemento=?, bairro=?, cidade=?, estado=?, cep=?
        WHERE id_pessoa=?
      `;
      return run(sql, [
        dados.nome, dados.documento,
        dados.logradouro, dados.numero, dados.complemento,
        dados.bairro, dados.cidade, dados.estado, dados.cep,
        id
      ]);
    },

    deletar(id) {
      /* DML - DELETE  — construído em aula */
      return run(`DELETE FROM Pessoa WHERE id_pessoa = ?`, [id]);
    }
  };

  // ── Estudante ─────────────────────────────────────────────────
  const Estudante = {
    inserir(dados) {
      return run(
        `INSERT INTO Estudante (id_pessoa, num_matricula, curso) VALUES (?, ?, ?)`,
        [dados.id_pessoa, dados.num_matricula, dados.curso]
      );
    },
    listarTodos() {
      return query(`
        SELECT e.id_estudante, p.nome, p.documento,
               e.num_matricula, e.curso
        FROM Estudante e
        JOIN Pessoa p ON p.id_pessoa = e.id_pessoa
        ORDER BY p.nome
      `);
    },
    deletar(id) { return run(`DELETE FROM Estudante WHERE id_estudante = ?`, [id]); }
  };

  // ── Funcionário ───────────────────────────────────────────────
  const Funcionario = {
    inserir(dados) {
      return run(
        `INSERT INTO Funcionario (id_pessoa, registro_funcional, data_admissao, setor)
         VALUES (?, ?, ?, ?)`,
        [dados.id_pessoa, dados.registro_funcional, dados.data_admissao, dados.setor]
      );
    },
    listarTodos() {
      return query(`
        SELECT f.id_funcionario, p.nome, p.documento,
               f.registro_funcional, f.data_admissao, f.setor
        FROM Funcionario f
        JOIN Pessoa p ON p.id_pessoa = f.id_pessoa
        ORDER BY p.nome
      `);
    },
    deletar(id) { return run(`DELETE FROM Funcionario WHERE id_funcionario = ?`, [id]); }
  };

  // ── Disciplina ────────────────────────────────────────────────
  const Disciplina = {
    inserir(dados) {
      return run(
        `INSERT INTO Disciplina (codigo, nome, carga_horaria) VALUES (?, ?, ?)`,
        [dados.codigo, dados.nome, dados.carga_horaria]
      );
    },
    listarTodas() {
      return query(`SELECT * FROM Disciplina ORDER BY nome`);
    },
    deletar(id) { return run(`DELETE FROM Disciplina WHERE id_disciplina = ?`, [id]); }
  };

  // ── MatriculaDisciplina ───────────────────────────────────────
  const MatriculaDisciplina = {
    inserir(dados) {
      return run(
        `INSERT INTO Matricula_Disciplina
           (id_estudante, id_disciplina, semestre, ano, nota_final)
         VALUES (?, ?, ?, ?, ?)`,
        [dados.id_estudante, dados.id_disciplina,
         dados.semestre, dados.ano, dados.nota_final]
      );
    },
    listarTodas() {
      return query(`
        SELECT md.id_md, p.nome AS estudante,
               d.nome AS disciplina, md.semestre, md.ano, md.nota_final
        FROM Matricula_Disciplina md
        JOIN Estudante e ON e.id_estudante = md.id_estudante
        JOIN Pessoa    p ON p.id_pessoa    = e.id_pessoa
        JOIN Disciplina d ON d.id_disciplina = md.id_disciplina
        ORDER BY md.ano DESC, md.semestre DESC
      `);
    },
    deletar(id) { return run(`DELETE FROM Matricula_Disciplina WHERE id_md = ?`, [id]); }
  };

  // ── Ministra ──────────────────────────────────────────────────
  const Ministra = {
    inserir(dados) {
      return run(
        `INSERT INTO Ministra (id_funcionario, id_disciplina) VALUES (?, ?)`,
        [dados.id_funcionario, dados.id_disciplina]
      );
    },
    listarTodas() {
      return query(`
        SELECT mn.id_ministra, p.nome AS funcionario,
               d.nome AS disciplina
        FROM Ministra mn
        JOIN Funcionario f ON f.id_funcionario = mn.id_funcionario
        JOIN Pessoa p      ON p.id_pessoa       = f.id_pessoa
        JOIN Disciplina d  ON d.id_disciplina   = mn.id_disciplina
        ORDER BY p.nome
      `);
    },
    deletar(id) { return run(`DELETE FROM Ministra WHERE id_ministra = ?`, [id]); }
  };

  // ── Orientacao ────────────────────────────────────────────────
  const Orientacao = {
    inserir(dados) {
      return run(
        `INSERT INTO Orientacao (id_funcionario, id_estudante) VALUES (?, ?)`,
        [dados.id_funcionario, dados.id_estudante]
      );
    },
    listarTodas() {
      return query(`
        SELECT o.id_orientacao,
               pf.nome AS orientador,
               pe.nome AS orientado
        FROM Orientacao o
        JOIN Funcionario f ON f.id_funcionario = o.id_funcionario
        JOIN Pessoa pf     ON pf.id_pessoa     = f.id_pessoa
        JOIN Estudante e   ON e.id_estudante   = o.id_estudante
        JOIN Pessoa pe     ON pe.id_pessoa     = e.id_pessoa
        ORDER BY pf.nome
      `);
    },
    deletar(id) { return run(`DELETE FROM Orientacao WHERE id_orientacao = ?`, [id]); }
  };

  // ── API pública ───────────────────────────────────────────────
  return {
    init,
    run,
    query,
    exportDB,
    Pessoa,
    Estudante,
    Funcionario,
    Disciplina,
    MatriculaDisciplina,
    Ministra,
    Orientacao
  };

})();

