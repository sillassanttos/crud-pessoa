const { v4: uuidv4 } = require('uuid');
const { executarQuery, executarTransacao, formatarSQL } = require('../config/database');

class PessoaModel {
    // Busca todas as pessoas com filtro opcional
    async buscarTodas(filtro = '') {
        const sql = `
            SELECT 
                id,
                cpf,
                nome,
                situacao,
                DATE_FORMAT(data_nascimento, '%Y-%m-%d') as data_nascimento
            FROM pessoas
            WHERE (nome LIKE ? OR cpf LIKE ?)
            ORDER BY nome ASC
        `;
        
        const parametros = [`%${filtro}%`, `%${filtro}%`];
        return await executarQuery(sql, parametros);
    }

    // Busca uma pessoa específica pelo ID
    async buscarPorId(id) {
        const sql = `
            SELECT 
                id,
                cpf,
                nome,
                situacao,
                DATE_FORMAT(data_nascimento, '%Y-%m-%d') as data_nascimento
            FROM pessoas
            WHERE id = ?
        `;
        
        const resultados = await executarQuery(sql, [id]);
        return resultados[0];
    }

    // Verifica se CPF já existe
    async verificarCpfExistente(cpf, id = null) {
        const sql = `
            SELECT COUNT(*) as total
            FROM pessoas
            WHERE cpf = ?
            ${id ? 'AND id != ?' : ''}
        `;
        
        const parametros = id ? [cpf, id] : [cpf];
        const [resultado] = await executarQuery(sql, parametros);
        return resultado.total > 0;
    }

    // Insere uma nova pessoa
    async inserir(pessoa) {
        const cpfExistente = await this.verificarCpfExistente(pessoa.cpf);
        if (cpfExistente) {
            throw new Error('CPF já cadastrado no sistema');
        }

        // Converte a string de data para objeto Date e verifica se é futura
    const dataNascimento = new Date(pessoa.data_nascimento);
    if (dataNascimento > new Date()) {
        throw new Error('Data de nascimento não pode ser futura');
    }

        const sql = `
            INSERT INTO pessoas (
                id,
                cpf,
                nome,
                situacao,
                data_nascimento
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const id = uuidv4();

        const dataFormatada = dataNascimento.toISOString().split('T')[0];

        const parametros = [
            id,
            pessoa.cpf,
            pessoa.nome,
            pessoa.situacao || 'A',
            dataFormatada
        ];

        await executarQuery(sql, parametros);
        return id;
    }

    // Atualiza uma pessoa existente
    async atualizar(id, pessoa) {
        const cpfExistente = await this.verificarCpfExistente(pessoa.cpf, id);
        if (cpfExistente) {
            throw new Error('CPF já cadastrado para outra pessoa');
        }

        if (new Date(pessoa.data_nascimento) > new Date()) {
            throw new Error('Data de nascimento não pode ser futura');
        }

        const sql = `
            UPDATE pessoas
            SET 
                cpf = ?,
                nome = ?,
                situacao = ?,
                data_nascimento = ?
            WHERE id = ?
        `;

        const parametros = [
            pessoa.cpf,
            pessoa.nome,
            pessoa.situacao,
            pessoa.data_nascimento,
            id
        ];

        const resultado = await executarQuery(sql, parametros);
        if (resultado.affectedRows === 0) {
            throw new Error('Pessoa não encontrada');
        }
        return true;
    }

    // Exclui uma pessoa
    async excluir(id) {
        const sql = 'DELETE FROM pessoas WHERE id = ?';
        const resultado = await executarQuery(sql, [id]);
        
        if (resultado.affectedRows === 0) {
            throw new Error('Pessoa não encontrada');
        }
        return true;
    }

    // Altera a situação de uma pessoa
    async alterarSituacao(id, novaSituacao) {
        if (!['A', 'I'].includes(novaSituacao)) {
            throw new Error('Situação inválida. Use A para Ativo ou I para Inativo');
        }

        const sql = `
            UPDATE pessoas
            SET situacao = ?
            WHERE id = ?
        `;

        const resultado = await executarQuery(sql, [novaSituacao, id]);
        if (resultado.affectedRows === 0) {
            throw new Error('Pessoa não encontrada');
        }
        return true;
    }
}

module.exports = new PessoaModel();