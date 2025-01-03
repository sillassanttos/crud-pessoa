// Configurações globais do SweetAlert2
const configSweetAlert = {
  confirmButtonColor: '#1f8dd6',
  cancelButtonColor: '#ca3c3c',
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar'
};

// Configuração do AJAX global
$.ajaxSetup({
  headers: {
      'X-Requested-With': 'XMLHttpRequest'
  }
});

// Função para formatar CPF
function formatarCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar data para o padrão brasileiro
function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR');
}

// Validação de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) {
      return false;
  }

  if (/^(\d)\1+$/.test(cpf)) {
      return false;
  }

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) {
      return false;
  }

  soma = 0;
  for (let i = 1; i <= 10; i++) {
      soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) {
      return false;
  }

  return true;
}

// Função para mostrar notificações
function mostrarNotificacao(tipo, mensagem, callback) {
  const configs = {
      ...configSweetAlert,
      title: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      text: mensagem,
      icon: tipo
  };

  if (callback) {
      Swal.fire(configs).then(callback);
  } else {
      Swal.fire(configs);
  }
}

// Função para confirmar ação
function confirmarAcao(titulo, mensagem, callback) {
  Swal.fire({
      ...configSweetAlert,
      title: titulo,
      text: mensagem,
      icon: 'warning',
      showCancelButton: true
  }).then((result) => {
      if (result.isConfirmed && callback) {
          callback();
      }
  });
}

// Inicialização de componentes quando o documento estiver pronto
$(document).ready(function() {
  // Inicialização das máscaras
  $('.cpf-mask').mask('000.000.000-00');
  
  // Tratamento de erros AJAX global
  $(document).ajaxError(function(event, jqXHR, settings, error) {
      const response = jqXHR.responseJSON || {};
      const mensagem = response.mensagem || 'Ocorreu um erro ao processar a requisição';
      const detalhes = response.erro?.detalhes || error;

      mostrarNotificacao('error', `${mensagem}\n${JSON.stringify(detalhes)}`);
  });

  // Inicialização dos tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // Handler para links de exclusão
// Handler para links de exclusão
$(document).on('click', '.btn-excluir', function(e) {
    e.preventDefault();
    const id = $(this).data('id');
    const elemento = $(this).closest('tr');

    Swal.fire({
        ...configSweetAlert,
        title: 'Confirmar exclusão',
        text: 'Esta ação não poderá ser desfeita. Deseja continuar?',
        icon: 'warning',
        showCancelButton: true
    }).then((result) => {
        if (result.isConfirmed) {
            $.post(`/pessoas/excluir/${id}`)
                .done(function(response) {
                    elemento.fadeOut(400, function() {
                        $(this).remove();
                        if ($('tbody tr').length === 0) {
                            location.reload();
                        }
                    });

                    Swal.fire({
                        ...configSweetAlert,
                        title: 'Sucesso',
                        text: 'Registro excluído com sucesso',
                        icon: 'success',
                        timer: 2000
                    });
                });
        }
    });
});

  // Handler para alteração de situação
  $('.situacao-select').change(function() {
      const id = $(this).data('id');
      const novaSituacao = $(this).val();
      const elementoSelect = $(this);

      confirmarAcao('Confirmar alteração', 'Deseja alterar a situação desta pessoa?', function() {
          $.post(`/pessoas/alterarSituacao/${id}`, { situacao: novaSituacao })
              .done(function(response) {
                  mostrarNotificacao('success', 'Situação alterada com sucesso');
              })
              .fail(function() {
                  elementoSelect.val(elementoSelect.data('situacao-atual'));
              });
      });
  });

  // Validação de formulários
  $('.pure-form').submit(function(e) {
      const form = $(this);
      
      // Validação do CPF
      const cpfInput = form.find('input[name="cpf"]');
      if (cpfInput.length && !validarCPF(cpfInput.val())) {
          e.preventDefault();
          mostrarNotificacao('error', 'CPF inválido');
          return false;
      }

      // Validação da data de nascimento
      const dataNascInput = form.find('input[name="data_nascimento"]');
      if (dataNascInput.length) {
          const dataNasc = new Date(dataNascInput.val());
          if (dataNasc > new Date()) {
              e.preventDefault();
              mostrarNotificacao('error', 'Data de nascimento não pode ser futura');
              return false;
          }
      }
  });

  // Filtro de pesquisa com debounce
  let timeoutPesquisa;
  $('#filtro-pesquisa').on('input', function() {
      clearTimeout(timeoutPesquisa);
      const valor = $(this).val();

      timeoutPesquisa = setTimeout(function() {
          $.get('/pessoas', { filtro: valor })
              .done(function(response) {
                  $('#tabela-pessoas tbody').html(response);
              });
      }, 500);
  });
});

// Exporta funções úteis para uso global
window.Helpers = {
  formatarCPF,
  formatarData,
  validarCPF,
  mostrarNotificacao,
  confirmarAcao
};