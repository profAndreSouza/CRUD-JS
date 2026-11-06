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
  // ──────────────────────────────────────────────────────────────
  // DDL completo do modelo "Universidade Comunitária"
  //
  // 💡 DIDÁTICA: durante a aula, apague o conteúdo das strings e
  //    reconstrua o SQL junto com os alunos, linha a linha.
  //    O arquivo scripts/DDL.sql está em branco para esse fim.
  // ──────────────────────────────────────────────────────────────
  const DDL = `

    PRAGMA foreign_keys = ON;

    -- ── 1. PESSOA (entidade-raiz) ──────────────────────────────
    --    Endereço composto: logradouro, numero, complemento,
    --                       bairro, cidade, estado, cep
    CREATE TABLE IF NOT EXISTS Pessoa (
      id_pessoa    INTEGER PRIMARY KEY AUTOINCREMENT,
      nome         TEXT    NOT NULL,
      documento    TEXT    NOT NULL UNIQUE,
      logradouro   TEXT,
      numero       TEXT,
      complemento  TEXT,
      bairro       TEXT,
      cidade       TEXT,
      estado       TEXT CHECK (LENGTH(estado) <= 2),
      cep          TEXT
    );

    -- ── 2. ESTUDANTE (especialização de Pessoa) ────────────────
    --    Especialização TOTAL e SOBREPOSTA:
    --    uma Pessoa pode ser Estudante E Funcionário ao mesmo tempo
    CREATE TABLE IF NOT EXISTS Estudante (
      id_estudante  INTEGER PRIMARY KEY AUTOINCREMENT,
      id_pessoa     INTEGER NOT NULL REFERENCES Pessoa(id_pessoa)
                            ON DELETE CASCADE,
      num_matricula TEXT    NOT NULL UNIQUE,
      curso         TEXT    NOT NULL
    );

    -- ── 3. FUNCIONARIO (especialização de Pessoa) ──────────────
    CREATE TABLE IF NOT EXISTS Funcionario (
      id_funcionario     INTEGER PRIMARY KEY AUTOINCREMENT,
      id_pessoa          INTEGER NOT NULL REFERENCES Pessoa(id_pessoa)
                                 ON DELETE CASCADE,
      registro_funcional TEXT    NOT NULL UNIQUE,
      data_admissao      TEXT    NOT NULL,  -- formato YYYY-MM-DD
      setor              TEXT    NOT NULL
    );

    -- ── 4. DISCIPLINA ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS Disciplina (
      id_disciplina INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo        TEXT    NOT NULL UNIQUE,
      nome          TEXT    NOT NULL,
      carga_horaria INTEGER NOT NULL CHECK (carga_horaria > 0)
    );

    -- ── 5. MATRICULA_DISCIPLINA (N:M com atributos) ────────────
    --    Estudante cursa Disciplina;
    --    atributos: semestre, ano, nota_final
    CREATE TABLE IF NOT EXISTS Matricula_Disciplina (
      id_md         INTEGER PRIMARY KEY AUTOINCREMENT,
      id_estudante  INTEGER NOT NULL REFERENCES Estudante(id_estudante)
                            ON DELETE CASCADE,
      id_disciplina INTEGER NOT NULL REFERENCES Disciplina(id_disciplina)
                            ON DELETE CASCADE,
      semestre      INTEGER NOT NULL CHECK (semestre IN (1,2)),
      ano           INTEGER NOT NULL,
      nota_final    REAL    CHECK (nota_final BETWEEN 0 AND 10),
      UNIQUE (id_estudante, id_disciplina, semestre, ano)
    );

    -- ── 6. MINISTRA (N:M Funcionário × Disciplina) ─────────────
    --    Um funcionário pode ministrar várias disciplinas;
    --    uma disciplina pode ser ministrada por vários funcionários
    CREATE TABLE IF NOT EXISTS Ministra (
      id_ministra    INTEGER PRIMARY KEY AUTOINCREMENT,
      id_funcionario INTEGER NOT NULL REFERENCES Funcionario(id_funcionario)
                             ON DELETE CASCADE,
      id_disciplina  INTEGER NOT NULL REFERENCES Disciplina(id_disciplina)
                             ON DELETE CASCADE,
      UNIQUE (id_funcionario, id_disciplina)
    );

    -- ── 7. ORIENTACAO (autorrelacionamento via Funcionário) ─────
    --    Papel ORIENTADOR → Funcionário
    --    Papel ORIENTADO  → Estudante  (máx. 1 orientador por estudante)
    CREATE TABLE IF NOT EXISTS Orientacao (
      id_orientacao  INTEGER PRIMARY KEY AUTOINCREMENT,
      id_funcionario INTEGER NOT NULL REFERENCES Funcionario(id_funcionario)
                             ON DELETE CASCADE,
      id_estudante   INTEGER NOT NULL REFERENCES Estudante(id_estudante)
                             ON DELETE CASCADE,
      UNIQUE (id_estudante)   -- cada estudante tem no máximo 1 orientador
    );

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

