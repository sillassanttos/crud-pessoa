const { query } = require('../banco_dados/conexao');
const { v4: uuidv4 } = require('uuid');

const Pessoa = {
    async listarTodas() {
        const sql = `SELECT id, cpf, nome, situacao, data_nascimento
                     FROM pessoas
                     ORDER BY nome`;
        try {
            const pessoas = await query(sql);
            return pessoas.map(pessoa => ({
                ...pessoa,
                data_nascimento: new Date(pessoa.data_nascimento).toLocaleDateString('pt-BR') // Formata a data para dd/mm/aaaa
            }));
        } catch (erro) {
            throw erro;
        }
    },

    async buscarPorId(id) {
        const sql = `SELECT id, cpf, nome, situacao, data_nascimento
                     FROM pessoas
                     WHERE id = ?`;
        try {
            const resultado = await query(sql, [id]);
            if (resultado.length === 0) {
                return null;
            }
            const pessoa = resultado[0];
            return {
                ...pessoa,
                data_nascimento: new Date(pessoa.data_nascimento).toISOString().split('T')[0] // Formata a data para yyyy-mm-dd (formato de input type="date")
            };
        } catch (erro) {
            throw erro;
        }
    },

    async buscarPorCpf(cpf) {
        const sql = `SELECT id, cpf, nome, situacao, data_nascimento
                     FROM pessoas
                     WHERE cpf = ?`;
        try {
            const resultado = await query(sql, [cpf]);
            return resultado[0] || null;
        } catch (erro) {
            throw erro;
        }
    },

    async buscarPorNome(nome) {
        const sql = `SELECT id, cpf, nome, situacao, data_nascimento
                     FROM pessoas
                     WHERE nome LIKE ?
                     ORDER BY nome`;
        try {
            const pessoas = await query(sql, [`%${nome}%`]);
            return pessoas.map(pessoa => ({
                ...pessoa,
                data_nascimento: new Date(pessoa.data_nascimento).toLocaleDateString('pt-BR')
            }));
        } catch (erro) {
            throw erro;
        }
    },

    async inserir(pessoa) {
        const sql = `INSERT INTO pessoas (id, cpf, nome, situacao, data_nascimento)
                     VALUES (?, ?, ?, ?, ?)`;
        const id = uuidv4(); // Gera um UUID para a pessoa
        const parametros = [
            id,
            pessoa.cpf,
            pessoa.nome,
            pessoa.situacao,
            pessoa.data_nascimento
        ];
        try {
            await query(sql, parametros);
            return { id, ...pessoa };
        } catch (erro) {
            throw erro;
        }
    },

    async atualizar(id, pessoa) {
        const sql = `UPDATE pessoas
                     SET cpf = ?, nome = ?, situacao = ?, data_nascimento = ?
                     WHERE id = ?`;
        const parametros = [
            pessoa.cpf,
            pessoa.nome,
            pessoa.situacao,
            pessoa.data_nascimento,
            id
        ];
        try {
            await query(sql, parametros);
            return { id, ...pessoa };
        } catch (erro) {
            throw erro;
        }
    },

    async excluir(id) {
        const sql = `DELETE FROM pessoas
                     WHERE id = ?`;
        try {
            await query(sql, [id]);
        } catch (erro) {
            throw erro;
        }
    }
};

module.exports = Pessoa;