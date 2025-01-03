// Configuração global do SweetAlert2
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

// Funções de utilidade
const formatarCPF = (cpf) => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR');
};

// Validações
const validarCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) {
      return false;
  }

  // Verifica CPFs com dígitos iguais
  if (/^(\d)\1+$/.test(cpf)) {
      return false;
  }

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto > 9 ? 0 : resto;
  
  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) {
      return false;
  }

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto > 9 ? 0 : resto;
  
  return digitoVerificador2 === parseInt(cpf.charAt(10));
};

const validarDataNascimento = (data) => {
  const dataNascimento = new Date(data);
  const hoje = new Date();
  return dataNascimento <= hoje;
};

// Manipuladores de eventos
document.addEventListener('DOMContentLoaded', () => {
  // Aplicar máscaras aos inputs
  const cpfInputs = document.querySelectorAll('input[name="cpf"]');
  cpfInputs.forEach(input => {
      $(input).mask('000.000.000-00', {
          reverse: true,
          clearIfNotMatch: true,
          placeholder: "___.___.___-__"
      });
  });

  // Monitorar eventos de formulário
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
          const cpfInput = form.querySelector('input[name="cpf"]');
          const dataInput = form.querySelector('input[name="data_nascimento"]');
          
          if (cpfInput && !validarCPF(cpfInput.value)) {
              e.preventDefault();
              await Swal.fire({
                  icon: 'error',
                  title: 'CPF inválido',
                  text: 'Por favor, digite um CPF válido.'
              });
              cpfInput.focus();
              return;
          }

          if (dataInput && !validarDataNascimento(dataInput.value)) {
              e.preventDefault();
              await Swal.fire({
                  icon: 'error',
                  title: 'Data inválida',
                  text: 'A data de nascimento não pode ser futura.'
              });
              dataInput.focus();
              return;
          }
      });
  });

  // Configurar tooltips
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(element => {
      element.addEventListener('mouseenter', (e) => {
          const tooltip = document.createElement('div');
          tooltip.className = 'tooltip';
          tooltip.textContent = e.target.getAttribute('data-tooltip');
          document.body.appendChild(tooltip);
          
          const rect = e.target.getBoundingClientRect();
          tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
          tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
      });

      element.addEventListener('mouseleave', () => {
          const tooltips = document.querySelectorAll('.tooltip');
          tooltips.forEach(tooltip => tooltip.remove());
      });
  });
});

// Tratamento de erros globais
window.addEventListener('error', (event) => {
  console.error('Erro JavaScript:', event.error);
  Toast.fire({
      icon: 'error',
      title: 'Ocorreu um erro inesperado'
  });
});

// Confirmações de ações
const confirmarAcao = async (mensagem, tipo = 'warning') => {
  return await Swal.fire({
      title: 'Confirmação',
      text: mensagem,
      icon: tipo,
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
      reverseButtons: true
  });
};

// Exportar funções para uso global
window.formatarCPF = formatarCPF;
window.formatarData = formatarData;
window.confirmarAcao = confirmarAcao;
window.Toast = Toast;