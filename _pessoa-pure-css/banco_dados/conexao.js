const mysql = require('mysql');

// Configurações da conexão
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'db_pessoa',
    multipleStatements: true // Permite múltiplas queries em uma única chamada
};

// Cria o pool de conexões
const pool = mysql.createPool({
    ...dbConfig,
    connectionLimit: 10 // Limite de conexões no pool
});

// Função para obter uma conexão do pool
function getConexao() {
    return new Promise((resolve, reject) => {
        pool.getConnection((erro, conexao) => {
            if (erro) {
                console.error('Erro ao obter conexão do pool:', erro);
                reject({
                    mensagem: 'Erro ao conectar ao banco de dados.',
                    erroCompleto: erro
                });
            } else {
                resolve(conexao);
            }
        });
    });
}

// Função para executar queries parametrizadas
async function query(sql, parametros) {
    try {
        const conexao = await getConexao();
        const resultado = await new Promise((resolve, reject) => {
            conexao.query(sql, parametros, (erro, resultado) => {
                conexao.release(); // Libera a conexão de volta para o pool
                if (erro) {
                    console.error('Erro ao executar a query:', erro);
                    reject({
                        mensagem: 'Erro ao executar a consulta no banco de dados.',
                        erroCompleto: erro
                    });
                } else {
                    resolve(resultado);
                }
            });
        });
        return resultado;
    } catch (erro) {
        throw erro; // Lança o erro para ser tratado no chamador
    }
}

module.exports = { query };