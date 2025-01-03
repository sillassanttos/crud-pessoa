const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const PessoaModel = require('../models/pessoaModel');

class PessoaController {
    async listar(req, res) {
        try {
            const filtro = req.query.filtro || '';
            const pessoas = await PessoaModel.buscarTodos(filtro);

            if (req.xhr) {
                return res.json(pessoas);
            }

            res.render('pessoa/listar', {
                pessoas,
                filtro,
                mensagem: req.flash('mensagem'),
                erro: req.flash('erro')
            });
        } catch (erro) {
            req.flash('erro', `Erro ao listar pessoas: ${erro.message}`);
            res.redirect('/dashboard');
        }
    }

    async exibirFormularioIncluir(req, res) {
        res.render('pessoa/incluir', {
            pessoa: {},
            erros: req.flash('erros'),
            mensagem: req.flash('mensagem'),
            erro: req.flash('erro')
        });
    }

    async incluir(req, res) {
        try {

            console.log('entrou aqui sim');

            const erros = validationResult(req);

            console.log(erros.array());
            
            if (!erros.isEmpty()) {
                return res.render('pessoa/incluir', {
                    pessoa: req.body,
                    erros: erros.array(),
                    erro: 'Por favor, corrija os erros no formulário.'
                });
            }
    
            const novaPessoa = {
                id: uuidv4(),
                cpf: req.body.cpf.replace(/\D/g, ''),
                nome: req.body.nome.trim(),
                situacao: req.body.situacao || 'A', // Define 'A' como padrão se não for informado
                data_nascimento: req.body.data_nascimento
            };
    
            console.log(novaPessoa);

            const resultado = await PessoaModel.criar(novaPessoa);
    
            if (resultado) {
                req.flash('mensagem', 'Pessoa cadastrada com sucesso!');
                return res.redirect('/pessoa/listar');
            } else {
                throw new Error('Não foi possível cadastrar a pessoa.');
            }
        } catch (erro) {
            console.error('Erro ao cadastrar pessoa:', erro);
            return res.render('pessoa/incluir', {
                pessoa: req.body,
                erro: `Erro ao cadastrar pessoa: ${erro.message}`
            });
        }
    }

    async exibirFormularioAlterar(req, res) {
        try {
            const { id } = req.params;
            const pessoa = await PessoaModel.buscarPorId(id);

            if (!pessoa) {
                req.flash('erro', 'Pessoa não encontrada.');
                return res.redirect('/pessoa/listar');
            }

            res.render('pessoa/alterar', {
                pessoa,
                erros: req.flash('erros'),
                mensagem: req.flash('mensagem'),
                erro: req.flash('erro')
            });
        } catch (erro) {
            req.flash('erro', `Erro ao buscar pessoa: ${erro.message}`);
            res.redirect('/pessoa/listar');
        }
    }

    async alterar(req, res) {
        try {
            const erros = validationResult(req);
            if (!erros.isEmpty()) {
                req.flash('erros', erros.array());
                return res.redirect(`/pessoa/alterar/${req.params.id}`);
            }

            const pessoaAtualizada = {
                id: req.params.id,
                cpf: req.body.cpf.replace(/\D/g, ''),
                nome: req.body.nome,
                situacao: req.body.situacao,
                data_nascimento: req.body.data_nascimento
            };

            const resultado = await PessoaModel.atualizar(pessoaAtualizada);

            if (resultado.affectedRows === 0) {
                req.flash('erro', 'Pessoa não encontrada para atualização.');
                return res.redirect('/pessoa/listar');
            }

            req.flash('mensagem', 'Pessoa atualizada com sucesso!');
            res.redirect('/pessoa/listar');
        } catch (erro) {
            req.flash('erro', `Erro ao atualizar pessoa: ${erro.message}`);
            res.redirect(`/pessoa/alterar/${req.params.id}`);
        }
    }

    async excluir(req, res) {
        try {
            const { id } = req.params;
            const resultado = await PessoaModel.excluir(id);

            if (resultado.affectedRows === 0) {
                return res.json({
                    sucesso: false,
                    mensagem: 'Pessoa não encontrada para exclusão.'
                });
            }

            res.json({
                sucesso: true,
                mensagem: 'Pessoa excluída com sucesso!'
            });
        } catch (erro) {
            res.status(500).json({
                sucesso: false,
                mensagem: `Erro ao excluir pessoa: ${erro.message}`
            });
        }
    }

    async verificarCpfDuplicado(req, res) {
        try {
            const { cpf, id } = req.query;
            const cpfLimpo = cpf.replace(/\D/g, '');
            const existe = await PessoaModel.verificarCpfDuplicado(cpfLimpo, id);
            res.json({ existe });
        } catch (erro) {
            res.status(500).json({
                erro: `Erro ao verificar CPF: ${erro.message}`
            });
        }
    }
}

module.exports = new PessoaController();