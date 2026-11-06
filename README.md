# 🎓 Universidade Comunitária — CRUD JS + SQLite

> Projeto didático para demonstrar como conectar **JavaScript puro** ao **SQLite** diretamente no browser, sem servidor, usando [sql.js](https://sql-js.github.io/sql.js/) (WebAssembly).

---

## 📁 Estrutura do Projeto

```
CRUD-JS/
├── index.html                 ← Interface principal (abre direto no browser)
├── css/
│   └── style.css              ← Estilos da aplicação
├── js/
│   ├── db.js                  ← Camada de acesso ao banco (DDL + API do SQLite)
│   └── app.js                 ← Controlador de UI (formulários, tabelas, eventos)
└── scripts/                   ← ✏️ Scripts da aula (preenchidos junto com os alunos)
    ├── DDL.sql                ← CREATE TABLE (estrutura do banco)
    ├── DML.sql                ← INSERT · UPDATE · DELETE
    └── DQL.sql                ← SELECT (consultas)
```

---

## 🚀 Como Executar

> **Não precisa de servidor.** Basta abrir o arquivo HTML no browser.

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` diretamente no **Google Chrome** ou **Microsoft Edge**
3. O banco SQLite é criado automaticamente na memória ao carregar a página
4. O status **✅ Banco pronto (memória)** confirma que o engine WASM foi carregado

> ⚠️ Os dados ficam em **memória RAM** e são perdidos ao recarregar a página.  
> Use o botão **💾 Exportar .db** para salvar o banco localmente.

---

## 🔌 Como o JavaScript se Conecta ao SQLite

A biblioteca **sql.js** compila o SQLite em WebAssembly (WASM) e o executa dentro do browser.  
O arquivo [`js/db.js`](js/db.js) encapsula toda a comunicação com o banco por meio do objeto global `DB`:

| Método | Descrição | Exemplo |
|---|---|---|
| `DB.init()` | Inicializa o engine WASM e executa o DDL | chamado automaticamente |
| `DB.run(sql, params)` | Executa INSERT / UPDATE / DELETE | `DB.run("INSERT INTO ...", [v1, v2])` |
| `DB.query(sql, params)` | Executa SELECT e retorna `Array<Object>` | `DB.query("SELECT * FROM Pessoa")` |
| `DB.exportDB()` | Faz download do banco como `universidade.db` | botão na tela |

```
Browser
  └── index.html
        ├── sql-wasm.js (CDN)   ← engine SQLite compilado em WASM
        ├── js/db.js            ← cria tabelas (DDL) + expõe DB.*
        └── js/app.js           ← captura formulários e chama DB.*
```

---

## ✏️ Onde Adicionar os Scripts da Aula

### 1 — DDL (CREATE TABLE)

**Arquivo de rascunho:** [`scripts/DDL.sql`](scripts/DDL.sql)  
**Onde colar no projeto:** [`js/db.js`](js/db.js), dentro da constante `DDL` (linha ~34)

```js
// js/db.js — linha ~34
const DDL = `

  -- Cole aqui o CREATE TABLE construído em aula
  CREATE TABLE IF NOT EXISTS Pessoa ( ... );
  CREATE TABLE IF NOT EXISTS Estudante ( ... );
  -- etc.

`;
```

> O DDL é executado automaticamente quando a página carrega (`DB.init()`).

---

### 2 — DML (INSERT · UPDATE · DELETE)

**Arquivo de rascunho:** [`scripts/DML.sql`](scripts/DML.sql)  
**Onde executar:** no **Console SQL** da própria interface (campo de texto azul escuro no topo da página)

**Passos:**
1. Escreva o comando DML no arquivo `scripts/DML.sql` junto com os alunos
2. Copie o trecho e cole no **Console SQL** na tela
3. Clique em **▶ Executar SQL**
4. O resultado (linhas afetadas) aparece abaixo do console

---

### 3 — DQL (SELECT)

**Arquivo de rascunho:** [`scripts/DQL.sql`](scripts/DQL.sql)  
**Onde executar:** no **Console SQL** da própria interface

**Passos:**
1. Escreva a consulta no arquivo `scripts/DQL.sql` junto com os alunos
2. Cole no **Console SQL** e clique em **▶ Executar SQL**
3. O resultado é renderizado como uma **tabela interativa** na tela

---

## 🗂️ Modelo de Dados

```
Pessoa (id_pessoa, nome, documento,
        logradouro, numero, complemento, bairro, cidade, estado, cep)
   │
   ├──▶ Estudante (id_estudante, id_pessoa, num_matricula, curso)
   │         │
   │         ├──▶ Matricula_Disciplina (semestre, ano, nota_final)
   │         │         └──▶ Disciplina (id_disciplina, codigo, nome, carga_horaria)
   │         │
   │         └──▶ Orientacao (orientado)
   │
   └──▶ Funcionario (id_funcionario, id_pessoa, registro_funcional,
   │                 data_admissao, setor)
         │
         ├──▶ Ministra ──▶ Disciplina
         │
         └──▶ Orientacao (orientador)
```

> **Especialização total e sobreposta:** uma mesma `Pessoa` pode ser `Estudante` **e** `Funcionário` ao mesmo tempo.

### Tabelas e Relacionamentos

| Tabela | Tipo | Descrição |
|---|---|---|
| `Pessoa` | Entidade-raiz | Dados pessoais + endereço composto |
| `Estudante` | Especialização | Subconjunto de Pessoa; matrícula e curso |
| `Funcionario` | Especialização | Subconjunto de Pessoa; registro e setor |
| `Disciplina` | Entidade | Código, nome e carga horária |
| `Matricula_Disciplina` | N:M com atributos | Estudante ↔ Disciplina (semestre, ano, nota) |
| `Ministra` | N:M | Funcionário ↔ Disciplina |
| `Orientacao` | Autorrelacionamento | Funcionário orienta Estudante (máx. 1 por estudante) |

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| HTML5 | — | Estrutura e formulários |
| CSS3 | — | Layout responsivo, abas, toast |
| JavaScript (ES2020) | — | Lógica de UI e integração com banco |
| [sql.js](https://github.com/sql-js/sql.js) | 1.10.2 | SQLite compilado em WebAssembly |

---

## 💡 Dicas para a Aula

- Mantenha o **DevTools aberto** (F12 → Console) para ver erros SQL em tempo real
- Use o **Console SQL** da interface para testar comandos antes de adicioná-los aos scripts
- O botão **🗑️ Limpar Banco** reinicia o banco do zero (útil para recomeçar os exercícios)
- O botão **💾 Exportar .db** salva o banco para abrir em ferramentas como [DB Browser for SQLite](https://sqlitebrowser.org/)
- A constraint `UNIQUE (id_estudante)` na tabela `Orientacao` garante que cada estudante tenha **no máximo um orientador**

