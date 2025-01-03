const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');

// Funções auxiliares de validação
const validarCPF = (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
        throw new Error('CPF deve conter 11 dígitos');
    }

    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
        throw new Error('CPF inválido');
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
        throw new Error('CPF inválido');
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
        throw new Error('CPF inválido');
    }

    return true;
};

// Validações comuns para inclusão e alteração
const validacoesPessoa = [
    body('cpf')
        .notEmpty().withMessage('CPF é obrigatório')
        .custom(validarCPF),
    
    body('nome')
        .notEmpty().withMessage('Nome é obrigatório')
        .trim()
        .isLength({ min: 3, max: 60 }).withMessage('Nome deve ter entre 3 e 60 caracteres')
        .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/).withMessage('Nome deve conter apenas letras'),
    
    body('data_nascimento')
        .notEmpty().withMessage('Data de nascimento é obrigatória')
        .isISO8601().withMessage('Data de nascimento inválida')
        .custom((value) => {
            if (new Date(value) > new Date()) {
                throw new Error('Data de nascimento não pode ser futura');
            }
            return true;
        }),
    
    body('situacao')
        .notEmpty().withMessage('Situação é obrigatória')
        .isIn(['A', 'I']).withMessage('Situação deve ser A-Ativo ou I-Inativo')
];

// Definição das rotas
router.get('/', pessoaController.listar.bind(pessoaController));

router.get('/incluir', 
    pessoaController.exibirFormularioInclusao.bind(pessoaController)
);

router.post('/incluir',
    validacoesPessoa,
    pessoaController.incluir.bind(pessoaController)
);

router.get('/alterar/:id',
    param('id').isUUID().withMessage('ID inválido'),
    pessoaController.exibirFormularioAlteracao.bind(pessoaController)
);

router.post('/alterar/:id',
    param('id').isUUID().withMessage('ID inválido'),
    validacoesPessoa,
    pessoaController.alterar.bind(pessoaController)
);

router.post('/excluir/:id',
    param('id').isUUID().withMessage('ID inválido'),
    pessoaController.excluir.bind(pessoaController)
);

router.post('/alterarSituacao/:id',
    param('id').isUUID().withMessage('ID inválido'),
    body('situacao')
        .isIn(['A', 'I']).withMessage('Situação deve ser A-Ativo ou I-Inativo'),
    pessoaController.alterarSituacao.bind(pessoaController)
);

module.exports = router;