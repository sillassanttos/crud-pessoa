const { validationResult } = require('express-validator');
const pessoaModel = require('../models/pessoaModel');

class PessoaController {
    async listar(req, res) {
        try {
            const filtro = req.query.filtro || '';
            const pessoas = await pessoaModel.buscarTodas(filtro);
            
            if (req.xhr) {
                return res.json({ pessoas });
            }

            res.render('layouts/padrao', {
                pagina: 'Pesquisar Pessoas',
                conteudo: 'pessoas/listar',
                pessoas,
                filtro
            });
        } catch (erro) {
            this.tratarErro(erro, req, res);
        }
    }

    async exibirFormularioInclusao(req, res) {
        try {
            res.render('layouts/padrao', {
                pagina: 'Incluir Pessoa',
                conteudo: 'pessoas/incluir',
                pessoa: {},
                erros: []
            });
        } catch (erro) {
            this.tratarErro(erro, req, res);
        }
    }

    async exibirFormularioAlteracao(req, res) {
        try {
            const pessoa = await pessoaModel.buscarPorId(req.params.id);
            
            if (!pessoa) {
                throw new Error('Pessoa não encontrada');
            }

            res.render('layouts/padrao', {
                pagina: 'Alterar Pessoa',
                conteudo: 'pessoas/alterar',
                pessoa,
                erros: []
            });
        } catch (erro) {
            this.tratarErro(erro, req, res);
        }
    }

    async incluir(req, res) {
        try {
            const erros = validationResult(req);
            
            if (!erros.isEmpty()) {
                return res.render('layouts/padrao', {
                    pagina: 'Incluir Pessoa',
                    conteudo: 'pessoas/incluir',
                    pessoa: req.body,
                    erros: erros.array()
                });
            }

            const id = await pessoaModel.inserir({
                cpf: req.body.cpf.replace(/\D/g, ''),
                nome: req.body.nome,
                data_nascimento: req.body.data_nascimento,
                situacao: req.body.situacao
            });

            if (req.xhr) {
                return res.json({
                    sucesso: true,
                    mensagem: 'Pessoa incluída com sucesso',
                    id
                });
            }

            req.flash('sucesso', 'Pessoa incluída com sucesso');
            res.redirect('/pessoas');
        } catch (erro) {
            this.tratarErro(erro, req, res);
        }
    }

    async alterar(req, res) {
        try {
            const erros = validationResult(req);
            
            if (!erros.isEmpty()) {
                return res.render('layouts/padrao', {
                    pagina: 'Alterar Pessoa',
                    conteudo: 'pessoas/alterar',
                    pessoa: { ...req.body, id: req.params.id },
                    erros: erros.array()
                });
            }

            await pessoaModel.atualizar(req.params.id, {
                cpf: req.body.cpf.replace(/\D/g, ''),
                nome: req.body.nome,
                data_nascimento: req.body.data_nascimento,
                situacao: req.body.situacao
            });

            if (req.xhr) {
                return res.json({
                    sucesso: true,
                    mensagem: 'Pessoa alterada com sucesso'
                });
            }

            req.flash('sucesso', 'Pessoa alterada com sucesso');
            res.redirect('/pessoas');
        } catch (erro) {
            this.tratarErro(erro, req, res);
        }
    }

    async excluir(req, res) {
        try {
            await pessoaModel.excluir(req.params.id);

            if (req.xhr) {
                return res.json({
                    sucesso: true,
                    mensagem: 'Pessoa excluída com sucesso'
                });
            }

            req.flash('sucesso', 'Pessoa excluída com sucesso');
            res.redirect('/pessoas');
        } catch (erro) {
            this.tratarErro(erro, req, res);
        }
    }

    async alterarSituacao(req, res) {
        try {
            await pessoaModel.alterarSituacao(req.params.id, req.body.situacao);

            if (req.xhr) {
                return res.json({
                    sucesso: true,
                    mensagem: 'Situação alterada com sucesso'
                });
            }

            req.flash('sucesso', 'Situação alterada com sucesso');
            res.redirect('/pessoas');
        } catch (erro) {
            this.tratarErro(erro, req, res);
        }
    }

    tratarErro(erro, req, res) {
        console.error('Erro no controlador de pessoas:', erro);

        if (req.xhr) {
            return res.status(500).json({
                sucesso: false,
                mensagem: erro.message,
                erro: {
                    mensagem: erro.message,
                    stack: erro.stack,
                    detalhes: erro
                }
            });
        }

        res.render('layouts/padrao', {
            pagina: 'Erro',
            conteudo: 'error',
            erro: {
                mensagem: erro.message,
                stack: erro.stack,
                detalhes: erro
            }
        });
    }
}

module.exports = new PessoaController();