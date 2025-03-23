const menuLateral = document.querySelector(".menu-lateral");
const pessoas = document.querySelector(".pessoas");
const destinatario = document.querySelector(".destinatario");
const mensagens = document.querySelector("main");
const uuid = "2663c959-bcfb-498e-abd1-d912bbb8288e";
let from,
    to,
    text,
    type;
let participanteSelecionado = null;
let ultimaMensagem;
let nome = {
    name: prompt("Qual é o seu nome?")
}

conectar();

function verificarParticipantes() {
    const promessa = axios.get(`https://mock-api.driven.com.br/api/v6/uol/participants/${uuid}`);
    promessa.then(atualizarParticipantes);
    from = `${nome.name}`;
    buscarMensagens();
    verificarConexao()
    setInterval(verificarConexao, 5000);
}

function atualizarParticipantes(part) {
    pessoas.innerHTML = "";
    if (participanteSelecionado != null) {

        part.data.forEach(pessoa => {
            if (pessoa.name !== nome.name && pessoa.name !== participanteSelecionado.id) {
                pessoas.innerHTML += `<div id="${pessoa.name}" class="pessoa" onclick="selecionarContato(this)">
                        <ion-icon name="person-circle"></ion-icon>${pessoa.name}
                        <ion-icon name="checkmark" class="contato"></ion-icon>
                    </div>`
            }
            else if (pessoa.name === participanteSelecionado.id) { pessoas.innerHTML += participanteSelecionado.outerHTML };
        })
        const todos = document.querySelector(".todos");
        const contatoSelecionado = document.querySelector(".contato-selecionado");
        if (contatoSelecionado === null) {
            todos.classList.add("contato-selecionado");
            atualizarDestinatario();
        }
    }
    else {
        part.data.forEach(pessoa => {
            if (pessoa.name !== nome.name) {
                pessoas.innerHTML += `<div id="${pessoa.name}" class="pessoa" onclick="selecionarContato(this)">
                            <ion-icon name="person-circle"></ion-icon>${pessoa.name}
                            <ion-icon name="checkmark" class="contato"></ion-icon>
                        </div>`
            }
        })
    }

}

function conectar() {
    const promessa = axios.post(`https://mock-api.driven.com.br/api/v6/uol/participants/${uuid}`, nome);
    promessa.then(verificarParticipantes);
    promessa.catch(trocarNome);
}

function trocarNome() {
    if (nome.name === "") {
        nome = {
            name: prompt("Você não deve deixar o nome em branco. Escolha um nome para continuar")
        }
    }
    else {
        nome = {
            name: prompt("Já existe um usuário com esse nome. Escolha outro nome para continuar")
        }
    }
    conectar();
}

function avisarDesconexao() {
    alert("Você foi desconectado. A página será recarregada para que possa continuar a utilizar o chat.");
    window.location.reload();
}

function verificarConexao() {
    axios.post(`https://mock-api.driven.com.br/api/v6/uol/status/${uuid}`, nome);
    const promessa = axios.get(`https://mock-api.driven.com.br/api/v6/uol/participants/${uuid}`);
    promessa.then(atualizarParticipantes);
    promessa.catch(avisarDesconexao);
    buscarMensagens();
}

function buscarMensagens() {
    const promessa = axios.get(`https://mock-api.driven.com.br/api/v6/uol/messages/${uuid}`);
    promessa.then(renderizarMensagens);
}

function renderizarMensagens(resposta) {
    ultimaMensagem = document.querySelector(".caixa-de-mensagem:last-child");
    mensagens.innerHTML = "";
    resposta.data.forEach(mensagem => {
        switch (mensagem.type) {
            case "status":
                mensagens.innerHTML += `<div class="status caixa-de-mensagem"><p style="color: #505050">(${mensagem.time})</p>&nbsp;<b>${mensagem.from}</b>&nbsp;${mensagem.text}</div>`;
                break;
            case "message":
                mensagens.innerHTML += `<div class="mensagem caixa-de-mensagem"><p style="color: #505050">(${mensagem.time})</p>&nbsp;<b>${mensagem.from}</b>&nbsp;para&nbsp;<b>${mensagem.to}</b>:&nbsp;${mensagem.text}</div>`;
                break;
            case "private_message":
                if (mensagem.from === nome.name || mensagem.to === nome.name) {
                    mensagens.innerHTML += `<div class="mensagem-privada caixa-de-mensagem"><p style="color: #505050">(${mensagem.time})</p>&nbsp;<b>${mensagem.from}</b>&nbsp;para&nbsp;<b>${mensagem.to}</b>:&nbsp;${mensagem.text}</div>`;
                }
                break;
        }
    })
    const novaMensagem = document.querySelector(".caixa-de-mensagem:last-child");
    if (ultimaMensagem.innerHTML !== novaMensagem.innerHTML) {
        novaMensagem.scrollIntoView();
    }
}

function enviarMensagem() {
    const contato = document.querySelector(".contato-selecionado");
    const visibilidade = document.querySelector(".visibilidade-selecionada");
    const textoMensagem = document.querySelector(".entrada-de-mensagem");
    switch (visibilidade.id) {
        case "Público":
            type = "message";
            break;
        case "Reservadamente":
            type = "private_message"
    }
    to = contato.id;
    text = textoMensagem.value;
    const mensagem = {
        from: `${from}`,
        to: `${to}`,
        text: `${text}`,
        type: `${type}`
    };
    const promessa = axios.post(`https://mock-api.driven.com.br/api/v6/uol/messages/${uuid}`, mensagem);
    promessa.then(buscarMensagens);
    promessa.catch(avisarDesconexao);
    textoMensagem.value = "";
}

function selecionarContato(contato) {
    const selecionado = document.querySelector(".contato-selecionado");
    selecionado.classList.remove("contato-selecionado");
    contato.classList.add("contato-selecionado");
    participanteSelecionado = document.querySelector(".pessoa.contato-selecionado");
    atualizarDestinatario()
}

function selecionarVisibilidade(visibilidade) {
    const selecionada = document.querySelector(".visibilidade-selecionada");
    selecionada.classList.remove("visibilidade-selecionada");
    visibilidade.classList.add("visibilidade-selecionada");
    atualizarDestinatario()
}

function atualizarDestinatario() {
    const contato = document.querySelector(".contato-selecionado");
    const visibilidade = document.querySelector(".visibilidade-selecionada");
    destinatario.innerHTML = `Enviando para ${contato.id} (${visibilidade.id})`;
}

function abrirMenu() {
    menuLateral.classList.remove("escondido");
}

function fecharMenu() {
    menuLateral.classList.add("escondido");
}