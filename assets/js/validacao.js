export function valida(input) {
  const tipoDeInput = input.dataset.tipo;

  if (validadores[tipoDeInput]) {
    validadores[tipoDeInput](input);
  }

  if (input.validity.valid) {
    input.parentElement.classList.remove("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML = "";
  } else {
    input.parentElement.classList.add("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML =
      mostraMensagemDeErro(tipoDeInput, input);
  }
}

const tiposDeErro = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "customError",
];

const mensagemDeErro = {
  nome: {
    valueMissing: "O campo nome não pode estar vazio.",
  },
  email: {
    valueMissing: "O campo email não pode estar vazio.",
    typeMismatch: "O email digitado não é válido.",
  },
  senha: {
    valueMissing: "O campo senha não pode estar vazio.",
    patternMismatch:
      "A senha deve conter entre 6 e 12 caracteres, e deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número.",
  },
  dataNascimento: {
    valueMissing: "O campo data de nascimento não pode estar vazio.",
    customError: "Você deve ser maior de 18 anos para se cadastrar.",
  },
  cpf: {
    valueMissing: "O campo CPF não pode estar vazio.",
    customError: "O CPF digitado não é válido.",
  },
  cep: {
    valueMissing: "O campo CEP não pode estar vazio.",
    patternMismatch: "O CEP digitado não é válido.",
    customError: "Não foi possível buscar o CEP.",
  },
  logradouro: {
    valueMissing: "O campo logradouro não pode estar vazio.",
  },
  cidade: {
    valueMissing: "O campo cidade não pode estar vazio.",
  },
  estado: {
    valueMissing: "O campo estado não pode estar vazio.",
  },
  preco: {
    valueMissing: "O campo preço não pode estar vazio.",
  },
};

const validadores = {
  dataNascimento: (input) => validaNascimento(input),
  cpf: (input) => validaCPF(input),
  cep: (input) => recuperarCEP(input),
};

function mostraMensagemDeErro(tipoDeInput, input) {
  let mensagem = "";
  tiposDeErro.forEach((erro) => {
    if (input.validity[erro]) {
      mensagem = mensagemDeErro[tipoDeInput][erro];
    }
  });
  return mensagem;
}

function validaNascimento(input) {
  const dataRecebida = new Date(input.value);
  let mensagem = "";

  if (!maiorQue18(dataRecebida)) {
    mensagem = "Você deve ser maior de 18 anos para se cadastrar.";
  }

  input.setCustomValidity(mensagem);
}

function maiorQue18(data) {
  const dataAtual = new Date();
  const dataMais18 = new Date(
    data.getUTCFullYear() + 18,
    data.getUTCMonth(),
    data.getUTCDate()
  );

  return dataMais18 <= dataAtual;
}

function validaCPF(cpf) {
  const cfpFormatado = cpf.value.replace(/\D/g, "");
  let mensagem = "";

  if (!checaCPFRepetido(cfpFormatado) || !checaEstruturaCPF(cfpFormatado)) {
    mensagem = "CPF inválido.";
  }

  cpf.setCustomValidity(mensagem);
}

function checaCPFRepetido(cpf) {
  const valoresRepetidos = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
    "12345678910",
  ];

  let cpfValido = true;

  valoresRepetidos.forEach((valor) => {
    if (valor == cpf) {
      cpfValido = false;
    } else if (cpf.length != 11) {
      cpfValido = false;
    }
  });

  return cpfValido;
}

function checaEstruturaCPF(cpf) {
  const multiplicador = 10;

  return checaDigitoVerificador(cpf, multiplicador);
}

function checaDigitoVerificador(cpf, multiplicador) {
  if (multiplicador >= 12) {
    return true;
  }

  let multiplicadorInicial = multiplicador;
  let soma = 0;
  const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split("");
  const digitoVerificador = cpf.charAt(multiplicador - 1);

  for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
    soma += cpfSemDigitos[contador] * multiplicadorInicial;
    contador++;
  }

  if (digitoVerificador == confirmaDigito(soma)) {
    return checaDigitoVerificador(cpf, multiplicador + 1);
  }

  return false;
}

function confirmaDigito(soma) {
  return 11 - (soma % 11);
}

function recuperarCEP(cep) {
  const cepFormatado = cep.value.replace(/\D/g, "");
  const url = `https://viacep.com.br/ws/${cepFormatado}/json/`;
  const options = {
    method: "GET",
    mode: "cors",
    headers: {
      "content-type": "application/json;charset=utf-8",
    },
  };

  if (!cep.validity.patternMismatch && !cep.validity.valueMissing) {
    fetch(url, options)
      .then((response) => {
        response.json().then((data) => {
          if (data.erro) {
            cep.setCustomValidity("CEP não encontrado.");
            return;
          }
          cep.setCustomValidity("");
          preencheCamposComCEP(data);
          return;
        });
      })
      .catch((e) => {
        cep.setCustomValidity("Não foi possível buscar o CEP.");
      });
  }
}

function preencheCamposComCEP(data) {
  const logradouro = document.querySelector("[data-tipo='logradouro']");
  const cidade = document.querySelector("[data-tipo='cidade']");
  const estado = document.querySelector("[data-tipo='estado']");

  logradouro.value = data.logradouro;
  cidade.value = data.localidade;
  estado.value = data.uf;
}
