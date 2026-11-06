-- ================================================================
-- DML.sql — Data Manipulation Language
-- Universidade Comunitária
-- ================================================================
-- Construído em aula com os alunos.
--
-- COMANDOS: INSERT · UPDATE · DELETE
-- ================================================================


-- ── INSERT em PESSOA ──────────────────────────────────────────
INSERT INTO pessoa 
        (nome, documento, logradouro, numero, complemento, bairro,
        cidade, estado, cep)
    VALUES 
        ('Richard Souza', '123.456.789-00', 'Rua das Flores', '123', 
        'Apartamento 456', 'Centro', 'São Paulo', 'SP', '12345-678');

-- ── INSERT em ESTUDANTE ───────────────────────────────────────


-- ── INSERT em FUNCIONARIO ─────────────────────────────────────
INSERT INTO funcionario (id_pessoa, registro_funcional, setor, data_admissao)
    VALUES (2, 'RF123456', 'Tecnologia da Informação', '2026-01-01');

-- ── INSERT em DISCIPLINA ──────────────────────────────────────


-- ── INSERT em MATRICULA_DISCIPLINA ────────────────────────────


-- ── INSERT em MINISTRA ────────────────────────────────────────


-- ── INSERT em ORIENTACAO ──────────────────────────────────────


-- ─────────────────────────────────────────────────────────────


-- ── UPDATE ────────────────────────────────────────────────────


-- ── DELETE ────────────────────────────────────────────────────



