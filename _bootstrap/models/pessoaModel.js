const conexao = require('../data/conexao');
const { v4: uuidv4 } = require('uuid');

class PessoaModel {

  listarPessoas(filtros, callback) {
    let sql = `SELECT 
        id,
        cpf,
        nome,
        CASE situacao
        WHEN 'A' THEN 'Ativo'
        WHEN 'I' THEN 'Inativo'
        END AS situacao,
        DATE_FORMAT(data_nascimento, '%d/%m/%Y') AS data_nascimento,
        foto,
        TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE()) AS idade
    FROM pessoas
    WHERE 1=1`;

    const params = [];

    if (filtros.filtro) {
      sql += ' AND (cpf = ? OR nome LIKE ?)';
      params.push(filtros.filtro);
      params.push(`%${filtros.filtro}%`);
    }

    sql += ' ORDER BY nome';

    conexao.query(sql, params, (erro, resultados) => {
      if (erro) {
        callback(erro, null);
      } else {
        callback(null, resultados);
      }
    });
  }

  buscarPessoaPorId(id, callback) {
    const sql = `SELECT 
                    id,
                    cpf,
                    nome,
                    situacao,
                    DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS data_nascimento,
                    foto
                  FROM pessoas
                  WHERE id = ?`;
    conexao.query(sql, [id], (erro, resultados) => {
      if (erro) {
        callback(erro, null);
      } else {
        callback(null, resultados[0]);
      }
    });
  }

  buscarPessoaPorCpf(cpf, callback) {
    const sql = `SELECT 
                  id
                FROM pessoas
                WHERE cpf = ?`;
    conexao.query(sql, [cpf], (erro, resultados) => {
      if (erro) {
        callback(erro, null);
      } else {
        callback(null, resultados[0]);
      }
    });
  }

  inserirPessoa(pessoa, callback) {
    pessoa.id = uuidv4();
    const sql = 'INSERT INTO pessoas SET ?';
    conexao.query(sql, pessoa, (erro, resultados) => {
      if (erro) {
        callback(erro, null);
      } else {
        callback(null, { id: pessoa.id, ...pessoa });
      }
    });
  }

  atualizarPessoa(id, pessoa, callback) {
    const sql = 'UPDATE pessoas SET ? WHERE id = ?';
    conexao.query(sql, [pessoa, id], (erro, resultados) => {
      if (erro) {
        callback(erro, null);
      } else {
        callback(null, { id, ...pessoa });
      }
    });
  }

  excluirPessoa(id, callback) {
    const sql = 'DELETE FROM pessoas WHERE id = ?';
    conexao.query(sql, [id], (erro, resultados) => {
      if (erro) {
        callback(erro, null);
      } else {
        callback(null, resultados);
      }
    });
  }
}

module.exports = new PessoaModel();