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
CREATE TABLE pessoa (
    id_pessoa INTEGER PRIMARY KEY AUTOINCREMENT,    
    nome TEXT NOT NULL,
    documento TEXT NOT NULL UNIQUE,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT
);

-- ── 2. Tabela FUNCIONARIO (especialização de Pessoa) ──────────
CREATE TABLE funcionario (
    id_pessoa INTEGER PRIMARY KEY REFERENCES pessoa(id_pessoa),
    registro_funcional TEXT NOT NULL UNIQUE,
    setor TEXT NOT NULL,
    data_admissao TEXT
);

-- ── 3. Tabela ESTUDANTE (especialização de Pessoa) ────────────
CREATE TABLE estudante (
    id_pessoa INTEGER PRIMARY KEY REFERENCES pessoa(id_pessoa),
    id_orientador INTEGER REFERENCES funcionario(id_pessoa),
    num_matricula TEXT NOT NULL UNIQUE,
    curso TEXT NOT NULL
);

-- ── 4. Tabela DISCIPLINA ──────────────────────────────────────


-- ── 5. Tabela MATRICULA_DISCIPLINA (N:M com atributos) ────────


-- ── 6. Tabela MINISTRA (N:M Funcionário × Disciplina) ─────────


-- ── 7. Tabela ORIENTACAO (autorrelacionamento via Funcionário) ─



