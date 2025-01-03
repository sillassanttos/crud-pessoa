const PessoaModel = require('../models/pessoaModel');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

class PessoaController {
  async listarPessoas(req, res) {
    const filtros = {
      cpf: req.query.cpf,
      nome: req.query.nome
    };

    PessoaModel.listarPessoas(filtros, (erro, resultados) => {
      if (erro) {
        res.status(500).render('error/erro', { error: 'Erro ao listar pessoas', details: erro.message, user: req.cookies.nome });
      } else {
        res.render('pessoa/pesquisarPessoa', { pessoas: resultados, filtros: filtros, user: req.cookies.nome, req: req });
      }
    });
  }

  exibirFormularioInclusao(req, res) {
    res.render('pessoa/incluirPessoa', { errors: [], pessoa: {}, user: req.cookies.nome });
  }

  async incluirPessoa(req, res) {

    // Remove a formatação do CPF antes das validações
    const cpfSemFormatacao = req.body.cpf.replace(/\D/g, ''); // Remove tudo que não for dígito

    const pessoa = {
      cpf: cpfSemFormatacao,
      nome: req.body.nome,
      situacao: req.body.situacao,
      data_nascimento: req.body.data_nascimento,
      foto: req.file ? req.file.path : null
    };

    // Validações (ajustadas para usar o CPF sem formatação)
    const validacoes = [
      body('cpf').isLength({ min: 11, max: 11 }).withMessage('O CPF deve ter 11 caracteres')
        .custom((value) => /^[0-9]+$/.test(value)).withMessage('O CPF deve conter apenas números')
        .custom((value, { req }) => {
          return new Promise((resolve, reject) => {
            PessoaModel.buscarPessoaPorCpf(value, (err, result) => {
              if (err) {
                reject(new Error('Erro ao buscar CPF'));
              } else if (result) {
                reject(new Error('CPF já cadastrado'));
              } else {
                resolve();
              }
            });
          });
        }),
      body('nome').isLength({ min: 3, max: 60 }).withMessage('O nome deve ter entre 3 e 60 caracteres'),
      body('situacao').isIn(['A', 'I']).withMessage('A situação deve ser A (Ativo) ou I (Inativo)'),
      body('data_nascimento').isBefore(new Date().toISOString().split('T')[0]).withMessage('A data de nascimento não pode ser uma data futura')
    ];

    for (const validacao of validacoes) {
      await validacao.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      // Volta o CPF para o formato com máscara para mostrar o valor digitado pelo usuário
      pessoa.cpf = cpfSemFormatacao; //req.body.cpf;
      return res.render('pessoa/incluirPessoa', { errors: errors.array(), pessoa, user: req.cookies.nome });
    }

    PessoaModel.inserirPessoa(pessoa, (erro, resultados) => {
      if (erro) {
        res.status(500).render('error/erro', { error: 'Erro ao inserir pessoa', details: erro.message, user: req.cookies.nome });
      } else {
        res.render('pessoa/incluirPessoa', {
          errors: [{ msg: 'Pessoa cadastrada com sucesso!' }],
          pessoa: {},
          user: req.cookies.nome
        });
      }
    });
  }

  exibirFormularioEdicao(req, res) {
    const id = req.params.id;
    PessoaModel.buscarPessoaPorId(id, (erro, pessoa) => {
      if (erro) {
        res.status(500).render('error/erro', { error: 'Erro ao buscar pessoa', details: erro.message, user: req.cookies.nome });
      } else if (!pessoa) {
        res.status(404).render('error/erro', { error: 'Pessoa não encontrada', details: '', user: req.cookies.nome });
      } else {
        // Modifica o caminho da foto para a rota estática
        if (pessoa.foto) {
          pessoa.foto = pessoa.foto.replace('uploads', '/uploads'); 
        }
        res.render('pessoa/editarPessoa', { errors: [], pessoa, user: req.cookies.nome });
      }
    });
  }

  async atualizarPessoa(req, res) {
    const id = req.params.id;
    
     // Remove a formatação do CPF antes das validações
     const cpfSemFormatacao = req.body.cpf.replace(/\D/g, '');

     const pessoa = {
       cpf: cpfSemFormatacao, // Salva o CPF sem formatação
       nome: req.body.nome,
       situacao: req.body.situacao,
       data_nascimento: req.body.data_nascimento,
       foto: req.file ? req.file.path : null
     };

    // Validações (ajustadas para usar o CPF sem formatação)
    const validacoes = [
      body('cpf').isLength({ min: 11, max: 11 }).withMessage('O CPF deve ter 11 caracteres')
        .custom((value) => /^[0-9]+$/.test(value)).withMessage('O CPF deve conter apenas números')
        .custom((value, { req }) => {
          return new Promise((resolve, reject) => {
            PessoaModel.buscarPessoaPorCpf(value, (err, result) => {
              if (err) {
                reject(new Error('Erro ao buscar CPF'));
              } else if (result && result.id !== req.params.id) {
                reject(new Error('CPF já cadastrado'));
              } else {
                resolve();
              }
            });
          });
        }),
      body('nome').isLength({ min: 3, max: 60 }).withMessage('O nome deve ter entre 3 e 60 caracteres'),
      body('situacao').isIn(['A', 'I']).withMessage('A situação deve ser A (Ativo) ou I (Inativo)'),
      body('data_nascimento').isBefore(new Date().toISOString().split('T')[0]).withMessage('A data de nascimento não pode ser uma data futura')
    ];

    for (const validacao of validacoes) {
      await validacao.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      // Volta o CPF para o formato com máscara para mostrar o valor digitado pelo usuário
      pessoa.cpf = req.body.cpf;
      return res.render('pessoa/editarPessoa', { errors: errors.array(), pessoa, user: req.cookies.nome });
    }

    // Se uma nova foto foi enviada, excluir a antiga
    if (req.file) {
      PessoaModel.buscarPessoaPorId(id, (erro, pessoaAntiga) => {
        if (erro) {
          console.error('Erro ao buscar pessoa antiga:', erro);
        } else if (pessoaAntiga && pessoaAntiga.foto) {
          try {
            fs.unlinkSync(pessoaAntiga.foto);
          } catch (err) {
            console.error('Erro ao excluir foto antiga:', err);
          }
        }
      });
    }

    PessoaModel.atualizarPessoa(id, pessoa, (erro) => {
      if (erro) {
        res.status(500).render('error/erro', { error: 'Erro ao atualizar pessoa', details: erro.message, user: req.cookies.nome });
      } else {
        res.redirect(`/pessoa/editar/${id}?mensagem=Pessoa atualizada com sucesso!`);
      }
    });
  }

  excluirPessoa(req, res) {
    const id = req.params.id;

    PessoaModel.buscarPessoaPorId(id, (erro, pessoa) => {
      if (erro) {
        res.status(500).render('error/erro', { error: 'Erro ao buscar pessoa', details: erro.message, user: req.cookies.nome });
      } else if (!pessoa) {
        res.status(404).render('error/erro', { error: 'Pessoa não encontrada', details: '', user: req.cookies.nome });
      } else {
        // Excluir a foto, se existir
        if (pessoa.foto) {
          try {
            fs.unlinkSync(pessoa.foto);
          } catch (err) {
            console.error('Erro ao excluir foto:', err);
          }
        }

        PessoaModel.excluirPessoa(id, (erro) => {
          if (erro) {
            res.status(500).render('error/erro', { error: 'Erro ao excluir pessoa', details: erro.message, user: req.cookies.nome });
          } else {
            res.redirect('/pessoa/pesquisar?mensagem=Pessoa excluída com sucesso!');
          }
        });
      }
    });
  }
}

module.exports = new PessoaController();