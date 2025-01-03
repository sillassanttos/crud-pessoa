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
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Wrapper para promisificar o pool e facilitar o uso de async/await
const poolPromise = pool.promise();

// Função para executar queries parametrizadas
const executarQuery = async (sql, params) => {
    try {
        const [resultados] = await poolPromise.execute(sql, params);
        return resultados;
    } catch (erro) {
        console.error('Erro ao executar query:', erro);
        throw {
            mensagem: 'Erro ao executar operação no banco de dados',
            erro: erro.message,
            sqlMessage: erro.sqlMessage,
            sqlState: erro.sqlState,
            codigo: erro.code
        };
    }
};

// Função para executar transações
const executarTransacao = async (callback) => {
    const conexao = await poolPromise.getConnection();
    
    try {
        await conexao.beginTransaction();
        const resultado = await callback(conexao);
        await conexao.commit();
        return resultado;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
};

// Função para formatar queries SQL (helpful for debugging)
const formatarSQL = (sql, params) => {
    if (!params) return sql;
    return sql.replace(/\?/g, () => {
        const valor = params.shift();
        if (typeof valor === 'string') return `'${valor}'`;
        return valor;
    });
};

// Exporta as funções e o pool para uso em outros módulos
module.exports = {
    pool: poolPromise,
    executarQuery,
    executarTransacao,
    formatarSQL
};