const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const path = require('path');

// Importação das rotas
const pessoaRoutes = require('./routes/pessoaRoutes');

// Criação da aplicação Express
const app = express();

// Configuração do Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        formatarData: (data) => {
            if (!data) return '';
            const dataObj = new Date(data);
            return dataObj.toLocaleDateString('pt-BR');
        },
        formatarCPF: (cpf) => {
            if (!cpf) return '';
            return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        },
        formatarSituacao: (situacao) => {
            return situacao === 'A' ? 'Ativo' : 'Inativo';
        },
        equals: (a, b) => a === b,
        toJSON: (obj) => JSON.stringify(obj)
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuração dos middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'sua_chave_secreta_aqui',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Configuração dos arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para variáveis globais
app.use((req, res, next) => {
    res.locals.mensagem = req.flash('mensagem');
    res.locals.erro = req.flash('erro');
    res.locals.user = req.session.user || null;
    next();
});

// Configuração das rotas
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/dashboard', (req, res) => {
    res.render('dashboard', {
        layout: 'main',
        title: 'Dashboard - Sistema de Cadastro de Pessoas'
    });
});
app.use('/pessoa', pessoaRoutes);

// Middleware para tratamento de erros 404
app.use((req, res) => {
    res.status(404).render('errors/404', {
        layout: 'main',
        mensagem: 'Página não encontrada'
    });
});

// Middleware para tratamento de erros gerais
app.use((error, req, res, next) => {
    console.error('Erro na aplicação:', error);
    res.status(500).render('errors/500', {
        layout: 'main',
        mensagem: 'Erro interno do servidor',
        erro: process.env.NODE_ENV === 'development' ? error : {}
    });
});

// Configuração da porta e inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    console.error('Erro não tratado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('Promise rejeitada não tratada:', error);
    process.exit(1);
});