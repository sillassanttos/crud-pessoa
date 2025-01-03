const mysql = require('mysql2');

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'db_pessoa',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convertendo o pool para usar Promises, permitindo o uso de async/await
const poolPromise = pool.promise();

// Função para executar queries parametrizadas
async function executarQuery(sql, params = []) {
    try {
        const [resultados] = await poolPromise.execute(sql, params);
        return resultados;
    } catch (erro) {
        console.error('Erro ao executar query:', erro);
        throw erro;
    }
}

// Função para formatar queries SQL (melhora a legibilidade)
function formatarSQL(sql) {
    return sql
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\s*([(),])\s*/g, '$1 ')
        .replace(/\s+/g, ' ');
}

// Função para verificar a conexão com o banco de dados
async function testarConexao() {
    try {
        await poolPromise.execute('SELECT 1');
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    } catch (erro) {
        console.error('Erro ao conectar com o banco de dados:', erro);
        throw erro;
    }
}

// Função para encerrar o pool de conexões (útil ao finalizar a aplicação)
async function encerrarConexoes() {
    try {
        await poolPromise.end();
        console.log('Pool de conexões encerrado com sucesso!');
    } catch (erro) {
        console.error('Erro ao encerrar pool de conexões:', erro);
        throw erro;
    }
}

module.exports = {
    executarQuery,
    formatarSQL,
    testarConexao,
    encerrarConexoes
};