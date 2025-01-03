const Pessoa = require('../modelos/pessoa');
const { validationResult } = require('express-validator');

// Função auxiliar para formatar a data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

const PessoasControlador = {

    async listar(req, res) {
        try {
            const pessoas = await Pessoa.listarTodas();

            pessoas.forEach(pessoa => {
                pessoa.data_nascimento = formatarData(pessoa.data_nascimento);
            });

            res.render('pessoas/listagem', { pessoas, filtro: '' });
        } catch (erro) {
            res.render('erros/erro', { erro });
        }
    },

    async filtrar(req, res) {
        const { filtro } = req.query;
        try {
            let pessoas;
            if (!filtro) {
                pessoas = await Pessoa.listarTodas();
            } else if (filtro.length === 11 && !isNaN(filtro)) {
                pessoas = await Pessoa.buscarPorCpf(filtro);
                pessoas = pessoas ? [pessoas] : []; // Se encontrou por CPF, retorna um array com a pessoa
            } else {
                pessoas = await Pessoa.buscarPorNome(filtro);
            }

             // Formata a data para todas as buscas
             pessoas.forEach(pessoa => {
                pessoa.data_nascimento = formatarData(pessoa.data_nascimento);
            });
            
            res.render('pessoas/listagem', { pessoas, filtro: filtro });
        } catch (erro) {
            res.render('erros/erro', { erro });
        }
    },

    
    async exibirFormularioInclusao(req, res) {
        // Correção aqui: passar um objeto pessoa vazio
        res.render('pessoas/formulario', { pessoa: {}, acao: 'incluir', erros: {} });
    },

    async incluir(req, res) {
        const errosVal = validationResult(req);
        if (!errosVal.isEmpty()) {
            return res.render('pessoas/formulario', {
                pessoa: req.body,
                acao: 'incluir',
                erros: errosVal.mapped()
            });
        }
    
        try {
            const pessoa = req.body;
            await Pessoa.inserir(pessoa);
            req.flash('success', 'Pessoa cadastrada com sucesso!');
            res.redirect('/pessoas');
        } catch (erro) {
            res.render('erros/erro', { erro });
        }
    },

    async exibirFormularioEdicao(req, res) {
        const { id } = req.params;
        try {
            const pessoa = await Pessoa.buscarPorId(id);
            if (!pessoa) {
                return res.render('erros/erro', { erro: { mensagem: 'Pessoa não encontrada.' } });
            }
            res.render('pessoas/formulario', { pessoa, acao: 'editar', erros: {} });
        } catch (erro) {
            res.render('erros/erro', { erro });
        }
    },

    async editar(req, res) {
        const { id } = req.params;
        const errosVal = validationResult(req);
        if (!errosVal.isEmpty()) {
            return res.render('pessoas/formulario', {
                pessoa: { id, ...req.body },
                acao: 'editar',
                erros: errosVal.mapped()
            });
        }

        try {
            const pessoa = req.body;
            await Pessoa.atualizar(id, pessoa);
            req.flash('success', 'Pessoa atualizada com sucesso!');
            res.redirect('/pessoas');
        } catch (erro) {
            res.render('erros/erro', { erro });
        }
    },

    async excluir(req, res) {
        const { id } = req.params;
        try {
            await Pessoa.excluir(id);
            req.flash('success', 'Pessoa excluída com sucesso!');
            res.redirect('/pessoas');
        } catch (erro) {
            res.render('erros/erro', { erro });
        }
    }
};

module.exports = PessoasControlador;