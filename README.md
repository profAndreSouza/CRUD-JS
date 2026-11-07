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

### Como Executar os Scripts da Aula

Ao lado do **Console SQL**, há o botão **📂 Carregar Script**:

1. Clique no botão **📂 Carregar Script**.
2. Na janela que se abre, escolha qualquer arquivo `.sql` da pasta `scripts/` (como `DDL.sql`, `DML.sql` ou `DQL.sql`).
3. O script é lido localmente (sem erro de CORS), seu conteúdo é exibido no Console SQL e executado imediatamente no banco SQLite!
4. O resultado (confirmação ou tabela de resultados de consultas SELECT) é apresentado na caixa de resultados abaixo do console.

> **Dica:** Você também pode digitar ou colar diretamente comandos no campo de texto do Console SQL e clicar em **▶ Executar SQL**.

---

## 🗂️ Modelo de Dados

```
PESSOA (codigo, documento, nome,
        logradouro, numero, complemento, bairro, cidade, estado, cep)
   │
   ├──▶ ESTUDANTE (codigo, matricula, curso, id_orientador ──┐)
   │         │                                               │
   │         ├──▶ MATRICULA_DISCIPLINA                       │
   │         │    (id_estudante, disciplina_codigo,          │
   │         │     semestre, ano, nota_final)                │
   │         │         └──▶ DISCIPLINA (codigo, nome,        │
   │         │                         carga_horaria)        │
   │         │                                               │
   └──▶ FUNCIONARIO (codigo, registro_funcional,             │
         │           data_admissao, setor_lotacao)           │
         │                                                   │
         ├──▶ MINISTRA (id_funcionario, disciplina_codigo)   │
         │         └──▶ DISCIPLINA                           │
         │                                                   │
         └───────────────────────────────────────────────────┘
```

> **Especialização total e sobreposta:** uma mesma `PESSOA` pode ser `ESTUDANTE` **e** `FUNCIONARIO` ao mesmo tempo (compartilhando o mesmo `codigo`).  
> **Autorrelacionamento de Orientação:** modelado diretamente pelo campo `ESTUDANTE.id_orientador` apontando para `FUNCIONARIO.codigo` (0..1 : 0..N).

### Tabelas e Relacionamentos

| Tabela | Tipo | Chave Primária | Descrição |
|---|---|---|---|
| `PESSOA` | Entidade-raiz (Superclasse) | `codigo` | Dados pessoais e endereço composto |
| `ESTUDANTE` | Subclasse de Pessoa | `codigo` (PK/FK) | Matrícula, curso e FK `id_orientador` para Funcionário |
| `FUNCIONARIO` | Subclasse de Pessoa | `codigo` (PK/FK) | Registro funcional, data de admissão e setor de lotação |
| `DISCIPLINA` | Entidade | `codigo` (PK texto) | Código textual, nome e carga horária |
| `MATRICULA_DISCIPLINA` | N:M (com histórico) | `(id_estudante, disciplina_codigo, semestre, ano)` | Estudante ↔ Disciplina com notas e semestres |
| `MINISTRA` | N:M | `(id_funcionario, disciplina_codigo)` | Funcionário ↔ Disciplina |

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

