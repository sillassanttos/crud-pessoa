const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const pessoaRoutes = require('./routes/pessoaRoutes');

// Configuração do EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração da sessão (necessária para o connect-flash)
app.use(session({
    secret: 'crud-pessoa-secret',
    resave: false,
    saveUninitialized: false
}));

// Configuração do connect-flash
app.use(flash());

// Configuração dos middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração dos arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para injetar variáveis globais nas views
app.use((req, res, next) => {
    res.locals.titulo = 'Sistema de Cadastro de Pessoas';
    res.locals.versao = '1.0.0';
    res.locals.mensagens = req.flash();
    next();
});

// Configuração das rotas
app.get('/', (req, res) => {
    res.render('index', {
        pagina: 'Dashboard',
        mensagem: 'Bem-vindo ao Sistema de Cadastro de Pessoas'
    });
});

app.use('/pessoas', pessoaRoutes);

// Middleware de tratamento de erro 404
app.use((req, res, next) => {
    res.status(404).render('layouts/padrao', {
        pagina: 'Página não encontrada',
        conteudo: 'error',
        erro: {
            mensagem: 'A página solicitada não foi encontrada',
            status: 404
        }
    });
});

// Middleware de tratamento de erros gerais
app.use((erro, req, res, next) => {
    console.error('Erro na aplicação:', erro);
    
    res.status(erro.status || 500).render('layouts/padrao', {
        pagina: 'Erro',
        conteudo: 'error',
        erro: {
            mensagem: erro.mensagem || 'Ocorreu um erro interno no servidor',
            detalhes: erro,
            stack: erro.stack,
            status: erro.status || 500
        }
    });
});

// Inicialização do servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Pressione CTRL+C para encerrar');
});