const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');

// Middleware de validação comum para inclusão e alteração
const validacoesPessoa = [
    body('nome')
        .trim()
        .isLength({ min: 3, max: 60 })
        .withMessage('O nome deve ter entre 3 e 60 caracteres')
        .matches(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ ]+$/)
        .withMessage('O nome deve conter apenas letras e espaços'),

    body('cpf')
        .trim()
        .notEmpty()
        .withMessage('CPF é obrigatório')
        .matches(/^\d{11}$/)
        .withMessage('CPF deve conter 11 dígitos numéricos')
        .custom(async (cpf, { req }) => {
            cpf = cpf.replace(/\D/g, '');
            const existe = await pessoaController.verificarCpfDuplicado(cpf, req.params.id);
            if (existe) {
                throw new Error('CPF já cadastrado');
            }
            return true;
        }),

    body('situacao')
        .isIn(['A', 'I'])
        .withMessage('Situação deve ser A-Ativo ou I-Inativo'),

    body('data_nascimento')
        .notEmpty()
        .withMessage('Data de nascimento é obrigatória')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Data de nascimento deve estar no formato YYYY-MM-DD')
        .custom(data => {
            const dataNascimento = new Date(data);
            const hoje = new Date();
            if (dataNascimento > hoje) {
                throw new Error('Data de nascimento não pode ser futura');
            }
            return true;
        })
];

// Rota para a listagem de pessoas
router.get('/listar', pessoaController.listar);

// Rotas para inclusão
router.get('/incluir', pessoaController.exibirFormularioIncluir);
router.post('/incluir', [
    body('nome')
        .trim()
        .isLength({ min: 3, max: 60 })
        .withMessage('O nome deve ter entre 3 e 60 caracteres')
        .matches(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ ]+$/)
        .withMessage('O nome deve conter apenas letras e espaços'),

        // req.body.cpf.replace(/\D/g, ''),
    body('cpf')
        .trim()
        .notEmpty()
        .withMessage('CPF é obrigatório')
        .matches(/^\d{11}$/)
        .withMessage('CPF deve conter 11 dígitos numéricos.'),

    body('situacao')
        .isIn(['A', 'I'])
        .withMessage('Situação deve ser A-Ativo ou I-Inativo'),

    body('data_nascimento')
        .notEmpty()
        .withMessage('Data de nascimento é obrigatória')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Data de nascimento deve estar no formato YYYY-MM-DD')
], pessoaController.incluir);

// Rotas para alteração
router.get('/alterar/:id', pessoaController.exibirFormularioAlterar);
router.post('/alterar/:id', validacoesPessoa, pessoaController.alterar);

// Rota para exclusão
router.delete('/excluir/:id', pessoaController.excluir);

// Rota para verificação de CPF duplicado via AJAX
router.get('/verificar-cpf', async (req, res) => {
    query('cpf')
        .trim()
        .notEmpty()
        .withMessage('CPF é obrigatório')
        .matches(/^\d{11}$/)
        .withMessage('CPF deve conter 11 dígitos numéricos');
        
    await pessoaController.verificarCpfDuplicado(req, res);
});

module.exports = router;