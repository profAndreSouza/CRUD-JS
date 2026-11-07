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
  // init() — carrega o motor WASM e cria uma instância limpa
  // (As tabelas NÃO são criadas automaticamente; devem ser
  //  executadas pelo usuário via Console SQL ou Carregar Script)
  // ─────────────────────────────────────────────────────────────
  async function init() {
    _SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
    });

    _db = new _SQL.Database();   // banco vazio em memória
    _db.run("PRAGMA foreign_keys = ON;"); // Habilita suporte a chaves estrangeiras

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
      if (dados.codigo) {
        const sql = `
          INSERT INTO PESSOA
            (codigo, documento, nome, logradouro, numero, complemento, bairro, cidade, estado, cep)
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return run(sql, [
          dados.codigo, dados.documento, dados.nome,
          dados.logradouro, dados.numero, dados.complemento,
          dados.bairro, dados.cidade, dados.estado, dados.cep
        ]);
      } else {
        const sql = `
          INSERT INTO PESSOA
            (documento, nome, logradouro, numero, complemento, bairro, cidade, estado, cep)
          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return run(sql, [
          dados.documento, dados.nome,
          dados.logradouro, dados.numero, dados.complemento,
          dados.bairro, dados.cidade, dados.estado, dados.cep
        ]);
      }
    },

    listarTodos() {
      return query(`SELECT * FROM PESSOA ORDER BY nome`);
    },

    buscarPorId(codigo) {
      return query(`SELECT * FROM PESSOA WHERE codigo = ?`, [codigo]);
    },

    atualizar(codigo, dados) {
      const sql = `
        UPDATE PESSOA SET
          documento=?, nome=?, logradouro=?, numero=?,
          complemento=?, bairro=?, cidade=?, estado=?, cep=?
        WHERE codigo=?
      `;
      return run(sql, [
        dados.documento, dados.nome,
        dados.logradouro, dados.numero, dados.complemento,
        dados.bairro, dados.cidade, dados.estado, dados.cep,
        codigo
      ]);
    },

    deletar(codigo) {
      return run(`DELETE FROM PESSOA WHERE codigo = ?`, [codigo]);
    }
  };

  // ── Estudante ─────────────────────────────────────────────────
  const Estudante = {
    inserir(dados) {
      return run(
        `INSERT INTO ESTUDANTE (codigo, matricula, curso, id_orientador) VALUES (?, ?, ?, ?)`,
        [dados.codigo, dados.matricula, dados.curso, dados.id_orientador || null]
      );
    },
    listarTodos() {
      return query(`
        SELECT e.codigo, p.nome, p.documento,
               e.matricula, e.curso,
               COALESCE(pf.nome, 'Sem orientador') AS orientador
        FROM ESTUDANTE e
        JOIN PESSOA p ON p.codigo = e.codigo
        LEFT JOIN FUNCIONARIO f ON f.codigo = e.id_orientador
        LEFT JOIN PESSOA pf ON pf.codigo = f.codigo
        ORDER BY p.nome
      `);
    },
    deletar(codigo) {
      return run(`DELETE FROM ESTUDANTE WHERE codigo = ?`, [codigo]);
    }
  };

  // ── Funcionário ───────────────────────────────────────────────
  const Funcionario = {
    inserir(dados) {
      return run(
        `INSERT INTO FUNCIONARIO (codigo, registro_funcional, data_admissao, setor_lotacao)
         VALUES (?, ?, ?, ?)`,
        [dados.codigo, dados.registro_funcional, dados.data_admissao, dados.setor_lotacao]
      );
    },
    listarTodos() {
      return query(`
        SELECT f.codigo, p.nome, p.documento,
               f.registro_funcional, f.data_admissao, f.setor_lotacao
        FROM FUNCIONARIO f
        JOIN PESSOA p ON p.codigo = f.codigo
        ORDER BY p.nome
      `);
    },
    deletar(codigo) {
      return run(`DELETE FROM FUNCIONARIO WHERE codigo = ?`, [codigo]);
    }
  };

  // ── Disciplina ────────────────────────────────────────────────
  const Disciplina = {
    inserir(dados) {
      return run(
        `INSERT INTO DISCIPLINA (codigo, nome, carga_horaria) VALUES (?, ?, ?)`,
        [dados.codigo, dados.nome, dados.carga_horaria]
      );
    },
    listarTodas() {
      return query(`SELECT * FROM DISCIPLINA ORDER BY nome`);
    },
    deletar(codigo) {
      return run(`DELETE FROM DISCIPLINA WHERE codigo = ?`, [codigo]);
    }
  };

  // ── MatriculaDisciplina ───────────────────────────────────────
  const MatriculaDisciplina = {
    inserir(dados) {
      return run(
        `INSERT INTO MATRICULA_DISCIPLINA
           (id_estudante, disciplina_codigo, semestre, ano, nota_final)
         VALUES (?, ?, ?, ?, ?)`,
        [dados.id_estudante, dados.disciplina_codigo,
         dados.semestre, dados.ano, dados.nota_final]
      );
    },
    listarTodas() {
      return query(`
        SELECT md.id_estudante, p.nome AS estudante,
               md.disciplina_codigo, d.nome AS disciplina,
               md.semestre, md.ano, md.nota_final
        FROM MATRICULA_DISCIPLINA md
        JOIN ESTUDANTE e ON e.codigo = md.id_estudante
        JOIN PESSOA    p ON p.codigo = e.codigo
        JOIN DISCIPLINA d ON d.codigo = md.disciplina_codigo
        ORDER BY md.ano DESC, md.semestre DESC
      `);
    },
    deletar(id_estudante, disciplina_codigo, semestre, ano) {
      return run(
        `DELETE FROM MATRICULA_DISCIPLINA 
         WHERE id_estudante = ? AND disciplina_codigo = ? AND semestre = ? AND ano = ?`,
        [id_estudante, disciplina_codigo, semestre, ano]
      );
    }
  };

  // ── Ministra ──────────────────────────────────────────────────
  const Ministra = {
    inserir(dados) {
      return run(
        `INSERT INTO MINISTRA (id_funcionario, disciplina_codigo) VALUES (?, ?)`,
        [dados.id_funcionario, dados.disciplina_codigo]
      );
    },
    listarTodas() {
      return query(`
        SELECT mn.id_funcionario, p.nome AS funcionario,
               mn.disciplina_codigo, d.nome AS disciplina
        FROM MINISTRA mn
        JOIN FUNCIONARIO f ON f.codigo = mn.id_funcionario
        JOIN PESSOA p      ON p.codigo = f.codigo
        JOIN DISCIPLINA d  ON d.codigo = mn.disciplina_codigo
        ORDER BY p.nome
      `);
    },
    deletar(id_funcionario, disciplina_codigo) {
      return run(
        `DELETE FROM MINISTRA WHERE id_funcionario = ? AND disciplina_codigo = ?`,
        [id_funcionario, disciplina_codigo]
      );
    }
  };

  // ── Orientacao (Autorrelacionamento em ESTUDANTE.id_orientador)
  const Orientacao = {
    definir(dados) {
      return run(
        `UPDATE ESTUDANTE SET id_orientador = ? WHERE codigo = ?`,
        [dados.id_funcionario, dados.id_estudante]
      );
    },
    remover(id_estudante) {
      return run(
        `UPDATE ESTUDANTE SET id_orientador = NULL WHERE codigo = ?`,
        [id_estudante]
      );
    },
    listarTodas() {
      return query(`
        SELECT e.codigo AS codigo_estudante,
               pe.nome AS estudante_orientado,
               e.matricula, e.curso,
               f.codigo AS codigo_orientador,
               pf.nome AS professor_orientador,
               f.registro_funcional,
               f.setor_lotacao
        FROM ESTUDANTE e
        JOIN PESSOA pe     ON pe.codigo = e.codigo
        JOIN FUNCIONARIO f ON f.codigo  = e.id_orientador
        JOIN PESSOA pf     ON pf.codigo = f.codigo
        ORDER BY pf.nome, pe.nome
      `);
    }
  };

  // ── API pública ───────────────────────────────────────────────
  return {
    init,
    run,
    query,
    exportDB,
    executeScript(sql) {
      if (!_db) throw new Error('Banco não inicializado. Chame DB.init() primeiro.');
      // sql.js exec executa múltiplas instruções e retorna resultados se houver SELECT
      return _db.exec(sql);
    },
    Pessoa,
    Estudante,
    Funcionario,
    Disciplina,
    MatriculaDisciplina,
    Ministra,
    Orientacao
  };

})();

