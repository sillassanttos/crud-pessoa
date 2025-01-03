const { executarQuery, formatarSQL } = require('../config/database');

class PessoaModel {
    async buscarTodos(filtro = '') {
        const sql = formatarSQL(`
            SELECT 
                id,
                cpf,
                nome,
                situacao,
                DATE_FORMAT(data_nascimento, '%Y-%m-%d') as data_nascimento
            FROM pessoas
            WHERE 
                (nome LIKE ? OR cpf LIKE ?)
            ORDER BY nome ASC
        `);

        const parametros = [`%${filtro}%`, `%${filtro}%`];
        return await executarQuery(sql, parametros);
    }

    async buscarPorId(id) {
        const sql = formatarSQL(`
            SELECT 
                id,
                cpf,
                nome,
                situacao,
                DATE_FORMAT(data_nascimento, '%Y-%m-%d') as data_nascimento
            FROM pessoas
            WHERE id = ?
        `);

        const resultados = await executarQuery(sql, [id]);
        return resultados.length > 0 ? resultados[0] : null;
    }

    async criar(pessoa) {
        try {
            const sql = formatarSQL(`
                INSERT INTO pessoas (
                    id,
                    cpf,
                    nome,
                    situacao,
                    data_nascimento
                ) VALUES (?, ?, ?, ?, ?)
            `);
    
            const parametros = [
                pessoa.id,
                pessoa.cpf,
                pessoa.nome,
                pessoa.situacao,
                pessoa.data_nascimento
            ];
    
            console.log('SQL:', sql);
            console.log('Parâmetros:', parametros);
    
            const resultado = await executarQuery(sql, parametros);
            return resultado.affectedRows > 0;
        } catch (erro) {
            console.error('Erro no modelo ao criar pessoa:', erro);
            throw erro;
        }
    }

    async atualizar(pessoa) {
        const sql = formatarSQL(`
            UPDATE pessoas 
            SET 
                cpf = ?,
                nome = ?,
                situacao = ?,
                data_nascimento = ?
            WHERE id = ?
        `);

        const parametros = [
            pessoa.cpf,
            pessoa.nome,
            pessoa.situacao,
            pessoa.data_nascimento,
            pessoa.id
        ];

        return await executarQuery(sql, parametros);
    }

    async excluir(id) {
        const sql = formatarSQL(`
            DELETE FROM pessoas 
            WHERE id = ?
        `);

        return await executarQuery(sql, [id]);
    }

    async verificarCpfDuplicado(cpf, idExcluir = null) {
        let sql = formatarSQL(`
            SELECT COUNT(*) as total 
            FROM pessoas 
            WHERE cpf = ?
        `);

        let parametros = [cpf];

        if (idExcluir) {
            sql = formatarSQL(`
                SELECT COUNT(*) as total 
                FROM pessoas 
                WHERE cpf = ? AND id != ?
            `);
            parametros.push(idExcluir);
        }

        const [resultado] = await executarQuery(sql, parametros);
        return resultado.total > 0;
    }

    async verificarDataNascimentoFutura(dataNascimento) {
        const sql = formatarSQL(`
            SELECT 
                CASE 
                    WHEN ? > CURRENT_DATE() THEN 1 
                    ELSE 0 
                END as data_futura
        `);

        const [resultado] = await executarQuery(sql, [dataNascimento]);
        return resultado.data_futura === 1;
    }
}

module.exports = new PessoaModel();