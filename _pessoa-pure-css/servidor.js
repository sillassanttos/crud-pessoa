const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const Mensagens = require('./util/mensagens');

const app = express();
const PORT = 3000;

// Configuração do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para analisar o corpo das requisições
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração de sessão
app.use(session({
    secret: 'seu_segredo_super_secreto', // Mude para uma chave secreta forte em produção
    resave: true,
    saveUninitialized: true
}));

// Middleware do Connect-Flash para mensagens temporárias
app.use(flash());

// Middleware global para passar variáveis para as views
app.use((req, res, next) => {
    res.locals.req = req; // Disponibiliza o objeto req em todas as views
    res.locals.Mensagens = Mensagens; // Disponibiliza o objeto Mensagens em todas as views
    next();
});

// Importa as rotas
const pessoasRotas = require('./rotas/pessoasRotas');

// Rota para o dashboard
app.get('/', (req, res) => {
    res.render('dashboard');
});

// Usa as rotas
app.use('/pessoas', pessoasRotas);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack); // Imprime o erro no console
    res.status(500).render('erros/erro', {
        erro: {
            mensagem: 'Erro interno do servidor.',
            erroCompleto: err // Em produção, evite expor detalhes do erro
        }
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});