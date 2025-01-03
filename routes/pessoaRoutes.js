const express = require('express');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');
const multer = require('multer');
const path = require('path');

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Rota para listar pessoas
router.get('/pesquisar', pessoaController.listarPessoas);

// Rota para exibir o formulário de inclusão de pessoa
router.get('/incluir', pessoaController.exibirFormularioInclusao);

// Rota para processar a inclusão de pessoa
router.post('/incluir', upload.single('foto'), pessoaController.incluirPessoa);

// Rota para exibir o formulário de edição de pessoa
router.get('/editar/:id', pessoaController.exibirFormularioEdicao);

// Rota para processar a edição de pessoa
router.post('/editar/:id', upload.single('foto'), pessoaController.atualizarPessoa);

// Rota para excluir pessoa
router.get('/excluir/:id', pessoaController.excluirPessoa);

module.exports = router;