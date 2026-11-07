-- ================================================================
-- DML.sql — Data Manipulation Language
-- Universidade Comunitária (Exercícios de Carga, Atualização e Remoção)
-- ================================================================

PRAGMA foreign_keys = ON;


-- ── 1. INSERT em PESSOA ───────────────────────────────────────
-- Cadastrar pessoas com documento único e endereço composto.




-- ── 2. INSERT em FUNCIONARIO ─────────────────────────────────
-- Vincular funcionários a códigos de pessoas já existentes.




-- ── 3. INSERT em ESTUDANTE ───────────────────────────────────
-- Cadastrar estudantes apontando para código de pessoa.
-- Incluir estudantes com orientador (id_orientador) e sem orientador (NULL).




-- ── 4. Especialização Sobreposta (Estudante E Funcionário) ────
-- Demonstrar a inserção de uma mesma pessoa em FUNCIONARIO e ESTUDANTE.




-- ── 5. INSERT em DISCIPLINA ───────────────────────────────────
-- Cadastrar disciplinas com código alfanumérico (ex: 'CC001') e carga horária.




-- ── 6. INSERT em MINISTRA ────────────────────────────────────
-- Associar docentes a disciplinas.
-- Demonstrar uma disciplina ministrada por mais de um docente.




-- ── 7. INSERT em MATRICULA_DISCIPLINA ─────────────────────────
-- Matricular estudantes em disciplinas (com semestre, ano e nota final).




-- ── 8. UPDATE ─────────────────────────────────────────────────
-- Exercícios:
-- a) Lançar ou alterar a nota de um estudante.
-- b) Atribuir ou trocar o orientador de um estudante.
-- c) Atualizar endereço de uma pessoa.




-- ── 9. DELETE ─────────────────────────────────────────────────
-- Exercícios:
-- a) Remover uma matrícula específica em disciplina.
-- b) Testar remoção com integridade referencial (ON DELETE CASCADE).



