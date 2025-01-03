const express = require('express');
const router = express.Router();
const PessoasControlador = require('../controladores/pessoasControlador');
const { body } = require('express-validator');
const Pessoa = require('../modelos/pessoa');

// Middleware para tratar erros nas rotas
function tratarErros(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
}

// Validações para inclusão e edição
const validacoes = [
    body('cpf')
        .notEmpty().withMessage('O CPF é obrigatório.')
        .isLength({ min: 11, max: 11 }).withMessage('O CPF deve ter 11 caracteres.')
        .isNumeric().withMessage('O CPF deve conter apenas números.')
        .custom((value, { req }) => {
            if (req.method === 'POST' && !req.body.id) { // Se for um novo cadastro (POST) e não houver ID
                return Pessoa.buscarPorCpf(value).then(pessoa => {
                    if (pessoa) {
                        return Promise.reject('CPF já cadastrado.');
                    }
                });
            }
            return true;
        }),
    body('nome')
        .notEmpty().withMessage('O nome é obrigatório.')
        .isLength({ min: 3, max: 60 }).withMessage('O nome deve ter entre 3 e 60 caracteres.'),
    body('situacao')
        .notEmpty().withMessage('A situação é obrigatória.')
        .isIn(['A', 'I']).withMessage('A situação deve ser A (Ativo) ou I (Inativo).'),
    body('data_nascimento')
        .notEmpty().withMessage('A data de nascimento é obrigatória.')
        .isISO8601().withMessage('A data de nascimento deve estar no formato AAAA-MM-DD.')
        .custom((value) => {
            const dataNascimento = new Date(value);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            if (dataNascimento > hoje) {
                throw new Error('A data de nascimento não pode ser uma data futura.');
            }
            return true;
        })
];

// Rota para listar pessoas (GET)
router.get('/', tratarErros(PessoasControlador.listar));

// Rota para filtrar pessoas (GET)
router.get('/filtrar', tratarErros(PessoasControlador.filtrar));

// Rota para exibir formulário de inclusão (GET)
router.get('/incluir', tratarErros(PessoasControlador.exibirFormularioInclusao));

// Rota para inserir pessoa (POST)
router.post('/incluir', validacoes, tratarErros(PessoasControlador.incluir));

// Rota para exibir formulário de edição (GET)
router.get('/editar/:id', tratarErros(PessoasControlador.exibirFormularioEdicao));

// Rota para editar pessoa (POST)
router.post('/editar/:id', validacoes, tratarErros(PessoasControlador.editar));

// Rota para excluir pessoa (GET)
router.get('/excluir/:id', tratarErros(PessoasControlador.excluir));

module.exports = router;