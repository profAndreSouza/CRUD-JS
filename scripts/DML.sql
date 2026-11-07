-- ================================================================
-- DML.sql — Data Manipulation Language
-- Universidade Comunitária (Carga de Dados, Atualizações e Remoções)
-- ================================================================

PRAGMA foreign_keys = ON;

-- ── 1. INSERT em PESSOA ───────────────────────────────────────
-- Cadastrando pessoas com endereço composto e documento único
INSERT INTO PESSOA (codigo, documento, nome, logradouro, numero, complemento, bairro, cidade, estado, cep)
VALUES
    (1, '111.111.111-11', 'Prof. Carlos Drummond', 'Av. Central', '1000', 'Bloco B, Sala 12', 'Centro', 'Chapecó', 'SC', '89801-000'),
    (2, '222.222.222-22', 'Profa. Ana Maria Machado', 'Rua das Acácias', '250', NULL, 'Jardins', 'Chapecó', 'SC', '89802-150'),
    (3, '333.333.333-33', 'Lucas Gabriel Silveira', 'Rua Marechal Deodoro', '45', 'Apto 201', 'São Cristóvão', 'Chapecó', 'SC', '89803-200'),
    (4, '444.444.444-44', 'Beatriz Lima Souza', 'Av. Fernando Machado', '890', 'Fundos', 'Líder', 'Chapecó', 'SC', '89805-300'),
    (5, '555.555.555-55', 'Mariana Silva Torres', 'Rua Uruguai', '120', 'Apto 402', 'Centro', 'Chapecó', 'SC', '89801-020'),
    (6, '666.666.666-66', 'Rodrigo Santos Costa', 'Rua Nereu Ramos', '77', NULL, 'Passo dos Fortes', 'Chapecó', 'SC', '89805-010');

-- ── 2. INSERT em FUNCIONARIO (Subclasse de Pessoa) ────────────
-- Pessoas 1 e 2 são docentes.
-- Pessoa 5 é técnica de TI E também é estudante (Sobreposição Total/Compartilhada).
INSERT INTO FUNCIONARIO (codigo, registro_funcional, data_admissao, setor_lotacao)
VALUES
    (1, 'RF-1001', '2018-02-15', 'Departamento de Ciência da Computação'),
    (2, 'RF-1002', '2020-03-01', 'Departamento de Matemática e Estatística'),
    (5, 'RF-1005', '2023-08-10', 'Laboratório de Redes e Sistemas');

-- ── 3. INSERT em ESTUDANTE (Subclasse de Pessoa) ──────────────
-- Pessoas 3, 4 e 6 são estudantes regulares.
-- Pessoa 5 é ESTUDANTE E FUNCIONÁRIA (mesmo codigo nas duas subclasses).
-- id_orientador aponta para FUNCIONARIO(codigo).
INSERT INTO ESTUDANTE (codigo, matricula, curso, id_orientador)
VALUES
    (3, 'MAT-202401', 'Ciência da Computação', 1),   -- Orientador: Carlos Drummond (código 1)
    (4, 'MAT-202402', 'Sistemas de Informação', 1),   -- Orientador: Carlos Drummond (código 1)
    (5, 'MAT-202405', 'Engenharia de Software', 2),   -- Orientador: Ana Maria (código 2)
    (6, 'MAT-202406', 'Ciência da Computação', NULL); -- Estudante ainda sem orientador

-- ── 4. INSERT em DISCIPLINA ───────────────────────────────────
INSERT INTO DISCIPLINA (codigo, nome, carga_horaria)
VALUES
    ('CC001', 'Banco de Dados I', 60),
    ('CC002', 'Banco de Dados II', 60),
    ('CC003', 'Algoritmos e Estruturas de Dados', 80),
    ('MAT01', 'Cálculo Diferencial e Integral', 90),
    ('ES001', 'Engenharia de Software e Requisitos', 60);

-- ── 5. INSERT em MINISTRA (N:M Funcionário × Disciplina) ──────
-- Observe que CC001 é ministrada por mais de um funcionário (código 1 e código 5).
INSERT INTO MINISTRA (id_funcionario, disciplina_codigo)
VALUES
    (1, 'CC001'), -- Carlos ministra Banco de Dados I
    (1, 'CC002'), -- Carlos ministra Banco de Dados II
    (2, 'MAT01'), -- Ana Maria ministra Cálculo
    (2, 'CC003'), -- Ana Maria ministra Algoritmos
    (5, 'CC001'); -- Mariana (técnica e instrutora) também ministra Banco de Dados I

-- ── 6. INSERT em MATRICULA_DISCIPLINA ─────────────────────────
-- Notas finais entre 0 e 10 (ou NULL se o aluno ainda estiver cursando).
INSERT INTO MATRICULA_DISCIPLINA (id_estudante, disciplina_codigo, semestre, ano, nota_final)
VALUES
    (3, 'CC001', 1, 2024, 8.5),
    (3, 'CC003', 1, 2024, 9.2),
    (4, 'CC001', 1, 2024, 5.5),
    (4, 'ES001', 2, 2024, 7.8),
    (5, 'CC002', 1, 2024, 9.8),
    (5, 'ES001', 2, 2024, 8.4),
    (6, 'MAT01', 1, 2024, 4.0),
    (6, 'CC001', 2, 2024, NULL); -- Cursando atualmente, sem nota lançada

-- ── 7. EXEMPLOS DE UPDATE ─────────────────────────────────────
-- Lançamento da nota do estudante Rodrigo em Banco de Dados I:
UPDATE MATRICULA_DISCIPLINA
SET nota_final = 7.5
WHERE id_estudante = 6 AND disciplina_codigo = 'CC001' AND semestre = 2 AND ano = 2024;

-- Atribuição de orientador para o estudante Rodrigo:
UPDATE ESTUDANTE
SET id_orientador = 1
WHERE codigo = 6;

-- Atualização de endereço da estudante Beatriz:
UPDATE PESSOA
SET logradouro = 'Av. Getúlio Vargas', numero = '1500', complemento = 'Apto 801'
WHERE codigo = 4;

-- ── 8. EXEMPLOS DE DELETE ─────────────────────────────────────
-- Cancelar a matrícula de Beatriz em Banco de Dados I (semestre 1 de 2024):
DELETE FROM MATRICULA_DISCIPLINA
WHERE id_estudante = 4 AND disciplina_codigo = 'CC001' AND semestre = 1 AND ano = 2024;
