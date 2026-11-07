-- ================================================================
-- DQL.sql — Data Query Language
-- Universidade Comunitária (15 Consultas Práticas)
-- ================================================================

-- ── 1. Listar todas as pessoas com endereço completo formatado 
SELECT 
    p.codigo,
    p.nome,
    p.documento,
    (p.logradouro || ', nº ' || p.numero || 
     COALESCE(' (' || p.complemento || ')', '') || 
     ' - ' || p.bairro || ', ' || p.cidade || '/' || p.estado || 
     ' - CEP: ' || p.cep) AS endereco_completo
FROM PESSOA p
ORDER BY p.nome;


-- ── 2. Listar todos os estudantes com dados pessoais (JOIN com PESSOA) 
SELECT 
    e.codigo,
    p.nome,
    p.documento,
    e.matricula,
    e.curso
FROM ESTUDANTE e
JOIN PESSOA p ON p.codigo = e.codigo
ORDER BY p.nome;


-- ── 3. Listar todos os funcionários com setor e data de admissão 
SELECT 
    f.codigo,
    p.nome,
    f.registro_funcional,
    f.data_admissao,
    f.setor_lotacao
FROM FUNCIONARIO f
JOIN PESSOA p ON p.codigo = f.codigo
ORDER BY p.nome;


-- ── 4. Pessoas que são Estudante E Funcionário (Especialização Sobreposta) 
SELECT 
    p.codigo,
    p.nome,
    e.matricula,
    e.curso,
    f.registro_funcional,
    f.setor_lotacao
FROM PESSOA p
JOIN ESTUDANTE e ON e.codigo = p.codigo
JOIN FUNCIONARIO f ON f.codigo = p.codigo;


-- ── 5. Disciplinas com carga horária >= 60 horas ───────────────
SELECT 
    codigo,
    nome,
    carga_horaria
FROM DISCIPLINA
WHERE carga_horaria >= 60
ORDER BY carga_horaria DESC, nome;


-- ── 6. Estudantes matriculados em uma disciplina específica (ex: CC001) 
SELECT 
    p.nome AS estudante,
    e.matricula,
    d.nome AS disciplina,
    md.semestre,
    md.ano,
    md.nota_final
FROM MATRICULA_DISCIPLINA md
JOIN ESTUDANTE e ON e.codigo = md.id_estudante
JOIN PESSOA p ON p.codigo = e.codigo
JOIN DISCIPLINA d ON d.codigo = md.disciplina_codigo
WHERE md.disciplina_codigo = 'CC001'
ORDER BY md.ano DESC, md.semestre DESC, p.nome;


-- ── 7. Histórico escolar: notas de cada estudante por disciplina e ano 
SELECT 
    p.nome AS estudante,
    d.codigo AS cod_disciplina,
    d.nome AS disciplina,
    md.ano,
    md.semestre,
    md.nota_final,
    CASE 
        WHEN md.nota_final IS NULL THEN 'Cursando'
        WHEN md.nota_final >= 6.0  THEN 'Aprovado'
        ELSE 'Reprovado'
    END AS situacao
FROM MATRICULA_DISCIPLINA md
JOIN ESTUDANTE e ON e.codigo = md.id_estudante
JOIN PESSOA p ON p.codigo = e.codigo
JOIN DISCIPLINA d ON d.codigo = md.disciplina_codigo
ORDER BY p.nome, md.ano, md.semestre;


-- ── 8. Funcionários e as disciplinas que ministram (N:M) ───────
SELECT 
    d.codigo AS cod_disciplina,
    d.nome AS disciplina,
    p.nome AS professor,
    f.registro_funcional,
    f.setor_lotacao
FROM MINISTRA m
JOIN DISCIPLINA d ON d.codigo = m.disciplina_codigo
JOIN FUNCIONARIO f ON f.codigo = m.id_funcionario
JOIN PESSOA p ON p.codigo = f.codigo
ORDER BY d.nome, p.nome;


-- ── 9. Orientadores e seus orientados (Autorrelacionamento via FUNCIONARIO) 
SELECT 
    po.nome AS estudante_orientado,
    eo.matricula,
    eo.curso,
    pf.nome AS professor_orientador,
    fo.registro_funcional AS rf_orientador,
    fo.setor_lotacao AS setor_orientador
FROM ESTUDANTE eo
JOIN PESSOA po ON po.codigo = eo.codigo
JOIN FUNCIONARIO fo ON fo.codigo = eo.id_orientador
JOIN PESSOA pf ON pf.codigo = fo.codigo
ORDER BY pf.nome, po.nome;


-- ── 10. Estudantes que ainda NÃO possuem orientador ────────────
SELECT 
    e.codigo,
    p.nome AS estudante,
    e.matricula,
    e.curso
FROM ESTUDANTE e
JOIN PESSOA p ON p.codigo = e.codigo
WHERE e.id_orientador IS NULL;


-- ── 11. Média de notas por disciplina ─────────────────────────
SELECT 
    d.codigo,
    d.nome AS disciplina,
    COUNT(md.id_estudante) AS total_avaliados,
    ROUND(AVG(md.nota_final), 2) AS media_geral,
    MIN(md.nota_final) AS menor_nota,
    MAX(md.nota_final) AS maior_nota
FROM DISCIPLINA d
JOIN MATRICULA_DISCIPLINA md ON md.disciplina_codigo = d.codigo
WHERE md.nota_final IS NOT NULL
GROUP BY d.codigo, d.nome
ORDER BY media_geral DESC;


-- ── 12. Estudantes aprovados (nota >= 6.0) ────────────────────
SELECT 
    p.nome AS estudante,
    e.matricula,
    d.nome AS disciplina,
    md.semestre,
    md.ano,
    md.nota_final
FROM MATRICULA_DISCIPLINA md
JOIN ESTUDANTE e ON e.codigo = md.id_estudante
JOIN PESSOA p ON p.codigo = e.codigo
JOIN DISCIPLINA d ON d.codigo = md.disciplina_codigo
WHERE md.nota_final >= 6.0
ORDER BY d.nome, md.nota_final DESC;


-- ── 13. Quantidade de orientandos por funcionário ─────────────
SELECT 
    pf.nome AS orientador,
    fo.registro_funcional,
    COUNT(e.codigo) AS total_orientandos
FROM FUNCIONARIO fo
JOIN PESSOA pf ON pf.codigo = fo.codigo
LEFT JOIN ESTUDANTE e ON e.id_orientador = fo.codigo
GROUP BY fo.codigo, pf.nome, fo.registro_funcional
ORDER BY total_orientandos DESC, pf.nome;


-- ── 14. Todos os estudantes e seus orientadores (LEFT JOIN) ───
SELECT 
    pe.nome AS estudante,
    e.matricula,
    e.curso,
    COALESCE(pf.nome, '⚠️ Sem orientador') AS orientador
FROM ESTUDANTE e
JOIN PESSOA pe ON pe.codigo = e.codigo
LEFT JOIN FUNCIONARIO f ON f.codigo = e.id_orientador
LEFT JOIN PESSOA pf ON pf.codigo = f.codigo
ORDER BY pe.nome;


-- ── 15. Total de disciplinas e carga horária ministrada por docente 
SELECT 
    p.nome AS professor,
    f.registro_funcional,
    COUNT(m.disciplina_codigo) AS total_disciplinas,
    SUM(d.carga_horaria) AS total_carga_horaria
FROM FUNCIONARIO f
JOIN PESSOA p ON p.codigo = f.codigo
JOIN MINISTRA m ON m.id_funcionario = f.codigo
JOIN DISCIPLINA d ON d.codigo = m.disciplina_codigo
GROUP BY f.codigo, p.nome, f.registro_funcional
ORDER BY total_carga_horaria DESC;
