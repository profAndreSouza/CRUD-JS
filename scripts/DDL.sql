-- ================================================================
-- DDL.sql — Data Definition Language
-- Universidade Comunitária (Modelo Físico)
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
-- Especialização total e sobreposta:
-- Uma pessoa DEVE ser estudante, funcionária ou ambas.
-- Endereço composto e documento único.
CREATE TABLE PESSOA (
    codigo       INTEGER PRIMARY KEY AUTOINCREMENT,
    documento    TEXT    NOT NULL UNIQUE,
    nome         TEXT    NOT NULL,
    logradouro   TEXT    NOT NULL,
    numero       TEXT    NOT NULL,
    complemento  TEXT,
    bairro       TEXT    NOT NULL,
    cidade       TEXT    NOT NULL,
    estado       TEXT    NOT NULL CHECK (LENGTH(estado) = 2),
    cep          TEXT    NOT NULL
);

-- ── 2. Tabela FUNCIONARIO (Subclasse de Pessoa) ───────────────
-- Herda a chave primária de PESSOA (codigo é PK e FK).
CREATE TABLE FUNCIONARIO (
    codigo             INTEGER PRIMARY KEY REFERENCES PESSOA(codigo) ON DELETE CASCADE,
    registro_funcional TEXT    NOT NULL UNIQUE,
    data_admissao      TEXT    NOT NULL, -- formato YYYY-MM-DD
    setor_lotacao      TEXT    NOT NULL
);

-- ── 3. Tabela ESTUDANTE (Subclasse de Pessoa) ─────────────────
-- Herda a chave primária de PESSOA (codigo é PK e FK).
-- id_orientador é FK para FUNCIONARIO(codigo) - autorrelacionamento via subclasse (0..1 : 0..N).
CREATE TABLE ESTUDANTE (
    codigo        INTEGER PRIMARY KEY REFERENCES PESSOA(codigo) ON DELETE CASCADE,
    matricula     TEXT    NOT NULL UNIQUE,
    curso         TEXT    NOT NULL,
    id_orientador INTEGER REFERENCES FUNCIONARIO(codigo) ON DELETE SET NULL
);

-- ── 4. Tabela DISCIPLINA ──────────────────────────────────────
-- Chave primária é o código textual (VARCHAR2 / TEXT).
CREATE TABLE DISCIPLINA (
    codigo        TEXT    PRIMARY KEY,
    nome          TEXT    NOT NULL,
    carga_horaria INTEGER NOT NULL CHECK (carga_horaria > 0)
);

-- ── 5. Tabela MATRICULA_DISCIPLINA (N:M Estudante × Disciplina)
-- Relacionamento N:M com atributos históricos (semestre, ano, nota_final).
-- Chave primária composta quádrupla.
CREATE TABLE MATRICULA_DISCIPLINA (
    id_estudante      INTEGER NOT NULL REFERENCES ESTUDANTE(codigo) ON DELETE CASCADE,
    disciplina_codigo TEXT    NOT NULL REFERENCES DISCIPLINA(codigo) ON DELETE CASCADE,
    semestre          INTEGER NOT NULL CHECK (semestre IN (1, 2)),
    ano               INTEGER NOT NULL CHECK (ano BETWEEN 1900 AND 9999),
    nota_final        REAL    CHECK (nota_final BETWEEN 0 AND 10),
    PRIMARY KEY (id_estudante, disciplina_codigo, semestre, ano)
);

-- ── 6. Tabela MINISTRA (N:M Funcionário × Disciplina) ─────────
-- Um funcionário pode ministrar várias disciplinas e uma disciplina
-- pode ser ministrada por mais de um funcionário.
CREATE TABLE MINISTRA (
    id_funcionario    INTEGER NOT NULL REFERENCES FUNCIONARIO(codigo) ON DELETE CASCADE,
    disciplina_codigo TEXT    NOT NULL REFERENCES DISCIPLINA(codigo) ON DELETE CASCADE,
    PRIMARY KEY (id_funcionario, disciplina_codigo)
);
