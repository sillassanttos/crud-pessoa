const Mensagens = {
  // Formata uma mensagem de sucesso para exibição
  formatarMensagemSucesso: (mensagem) => {
      return {
          tipo: 'success',
          titulo: 'Sucesso!',
          mensagem: mensagem
      };
  },

  // Formata uma mensagem de erro para exibição
  formatarMensagemErro: (mensagem) => {
      return {
          tipo: 'error',
          titulo: 'Erro!',
          mensagem: mensagem
      };
  },

  // Outras funções de formatação ou manipulação de mensagens podem ser adicionadas aqui
};

module.exports = Mensagens;