$(document).ready(function() {
  // MENSAGENS COM SWEETALERT2
  const urlParams = new URLSearchParams(window.location.search);
  const mensagem = urlParams.get('mensagem');

  if (mensagem) {
      Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: mensagem,
          showConfirmButton: true,
          confirmButtonText: 'Ok',
          customClass: {
              confirmButton: 'btn btn-success' // Adiciona a classe 'btn btn-success' ao botão de confirmação
          }
      });
  }

  // MÁSCARA PARA CPF
  function formatarCpf(cpf) {
      cpf = cpf.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
      if (cpf.length > 3) {
          cpf = cpf.substring(0, 3) + '.' + cpf.substring(3);
      }
      if (cpf.length > 7) {
          cpf = cpf.substring(0, 7) + '.' + cpf.substring(7);
      }
      if (cpf.length > 11) {
          cpf = cpf.substring(0, 11) + '-' + cpf.substring(11);
      }
      return cpf;
  }

  // Aplica a máscara ao campo CPF enquanto o usuário digita
  $('input[name="cpf"]').on('input', function() {
      $(this).val(formatarCpf($(this).val()));
  });
});