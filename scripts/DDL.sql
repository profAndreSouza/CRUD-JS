-- ================================================================
-- DDL.sql — Data Definition Language
-- Universidade Comunitária
-- ================================================================
-- Construído em aula com os alunos.
--
-- ENTIDADES DO MODELO:
--   Pessoa        → especialização TOTAL e SOBREPOSTA em:
--     ├── Estudante   (num_matricula, curso)
--     └── Funcionário (registro_funcional, data_admissao, setor)
--
--   Disciplina    (codigo, nome, carga_horaria)
--
-- RELACIONAMENTOS:
--   Orientacao        → Funcionário orienta Estudante  (1:N)
--   Ministra          → Funcionário ministra Disciplina (N:M)
--   Matricula_Disciplina → Estudante cursa Disciplina  (N:M)
--                         atributos: semestre, ano, nota_final
--
-- ENDEREÇO COMPOSTO de Pessoa:
--   logradouro, numero, complemento, bairro, cidade, estado, cep
-- ================================================================


-- ── 1. Tabela PESSOA ──────────────────────────────────────────


-- ── 2. Tabela ESTUDANTE (especialização de Pessoa) ────────────


-- ── 3. Tabela FUNCIONARIO (especialização de Pessoa) ──────────


-- ── 4. Tabela DISCIPLINA ──────────────────────────────────────


-- ── 5. Tabela MATRICULA_DISCIPLINA (N:M com atributos) ────────


-- ── 6. Tabela MINISTRA (N:M Funcionário × Disciplina) ─────────


-- ── 7. Tabela ORIENTACAO (autorrelacionamento via Funcionário) ─



