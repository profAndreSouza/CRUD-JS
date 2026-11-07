-- ================================================================
-- DDL.sql — Data Definition Language
-- Universidade Comunitária (Exercício de Modelagem Física)
-- ================================================================
-- Modelo Físico:
--   PESSOA (codigo, documento, nome, logradouro, numero, complemento,
--           bairro, cidade, estado, cep)
--   FUNCIONARIO (codigo [PK, FK], registro_funcional, data_admissao, setor_lotacao)
--   ESTUDANTE (codigo [PK, FK], matricula, curso, id_orientador [FK])
--   DISCIPLINA (codigo [PK], nome, carga_horaria)
--   MATRICULA_DISCIPLINA (id_estudante, disciplina_codigo, semestre, ano, nota_final)
--   MINISTRA (id_funcionario, disciplina_codigo)
-- ================================================================

PRAGMA foreign_keys = ON;

-- Limpeza prévia (ordem inversa de dependência)
DROP TABLE IF EXISTS MINISTRA;
DROP TABLE IF EXISTS MATRICULA_DISCIPLINA;
DROP TABLE IF EXISTS DISCIPLINA;
DROP TABLE IF EXISTS ESTUDANTE;
DROP TABLE IF EXISTS FUNCIONARIO;
DROP TABLE IF EXISTS PESSOA;


-- ── 1. Tabela PESSOA (Superclasse) ────────────────────────────
-- Dica: codigo INTEGER PRIMARY KEY AUTOINCREMENT, documento UNIQUE, endereço composto.




-- ── 2. Tabela FUNCIONARIO (Subclasse de PESSOA) ───────────────
-- Dica: codigo INTEGER PRIMARY KEY REFERENCES PESSOA(codigo), registro_funcional UNIQUE.




-- ── 3. Tabela ESTUDANTE (Subclasse de PESSOA) ─────────────────
-- Dica: codigo INTEGER PRIMARY KEY REFERENCES PESSOA(codigo),
-- id_orientador INTEGER REFERENCES FUNCIONARIO(codigo) (0..1 : 0..N).




-- ── 4. Tabela DISCIPLINA ──────────────────────────────────────
-- Dica: codigo TEXT PRIMARY KEY, CHECK (carga_horaria > 0).




-- ── 5. Tabela MATRICULA_DISCIPLINA (N:M Estudante × Disciplina)
-- Dica: PK composta (id_estudante, disciplina_codigo, semestre, ano).
-- CHECK semestre IN (1, 2), CHECK nota_final BETWEEN 0 AND 10.




-- ── 6. Tabela MINISTRA (N:M Funcionário × Disciplina) ─────────
-- Dica: PK composta (id_funcionario, disciplina_codigo).



