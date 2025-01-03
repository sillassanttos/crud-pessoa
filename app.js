const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs'); // Módulo File System já importado anteriormente
const pessoaRoutes = require('./routes/pessoaRoutes');
const conexao = require('./data/conexao');
const multer = require('multer'); // Import multer

const app = express();
const port = 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração do Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do Cookie Parser
app.use(cookieParser());

// Cria o diretório 'uploads' se não existir (FORA da pasta public)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Salva os arquivos na pasta 'uploads' fora da pasta 'public'
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Configuração de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
// Configuração da rota estática para servir arquivos de upload
app.use('/uploads', express.static(uploadDir));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/sweetalert2/dist')));

// Tratamento de erros (middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Gravar log de erro
  const errorLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'error.log'), { flags: 'a' });
  errorLogStream.write(`${new Date().toISOString()} - ${err.stack}\n`);
  errorLogStream.end();

  // Enviar resposta de erro
  res.status(500).render('error/erro', { error: 'Erro interno do servidor', details: err.message, user: req.cookies.nome });
});

// Rotas
app.use('/pessoa', pessoaRoutes);

// Rota principal - Dashboard
app.get('/', (req, res) => {
  res.render('dashboard/index', { user: req.cookies.nome });
});

// Inicialização do servidor
const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Tratamento de erros de conexão
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Porta ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requer privilégios elevados');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' já está em uso');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Teste de conexão com o banco de dados (CORRIGIDO)
conexao.getConnection((error, connection) => {
  if (error) {
    console.error('Erro ao obter conexão do pool:', error);
    return;
  }
  console.log('Conexão ao banco de dados estabelecida com sucesso!');
  connection.release(); // Libera a conexão de volta para o pool
});