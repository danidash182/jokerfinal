import WebSocket from 'ws';
import fetch from 'isomorphic-fetch';

const wss = new WebSocket.Server({ port: 8080 });

let allGamesArray = []
let JogadoresEmEspera = []

wss.on('connection', async function connection(ws) {
    console.log("_----------------------------_")
    if (!JogadoresEmEspera.includes(ws)) {
        console.log("jogador adicionado a fila de espera")
        JogadoresEmEspera.push(ws);

        //se houver duas pessoas em espera ou mais, vai criar um jogo
        if (JogadoresEmEspera.length >= 2) {
            //associa as pessoas para estarem no mesmo jogo pelas ws
            // startGame()
            console.log("jogo comecado")

            const idJogo = await createGame()
            const idJogadores = [0, 1]
            let jogadores = []

            jogadores = getPlayersStart()

            const jogo = {
                idJogo,
                idJogadores,
                jogadores
            }

            allGamesArray.push(jogo)

            const jogoAEnviar = [idJogo, idJogadores[0]]
            const jogoAEnviar2 = [idJogo, idJogadores[1]]

            const jogoSerializado = JSON.stringify(jogoAEnviar)
            const jogoSerializado2 = JSON.stringify(jogoAEnviar2)

            //envia o id do jogo criado aos utilizadores
            jogadores[0].send(jogoSerializado)
            jogadores[1].send(jogoSerializado2)
        }

        ws.on('close', (ws) => {
            console.log("alguem saiu")
            JogadoresEmEspera = JogadoresEmEspera.filter(x => x !== ws)
        })
    }

    ws.on("message", async function incoming(resposta) {
        const idJogo = getGameID(ws)
        let jogadores = []
        jogadores = getPlayers(ws)

        if (resposta === "respondido") {
            console.log("ninguem responde")

            jogadores[0].send("dontAnswer")
            jogadores[1].send("dontAnswer")
        }
        if (resposta === "pergunta tratada") {
            
            await mandaAtualizar(jogadores)
            trataProxima(idJogo)
        }
        // if (resposta === "incrementa") {
        //     console.log("vou incrementar > websocket")
        //     trataProxima(idJogo)
        // }
    }
    )
});

async function mandaAtualizar(jogadores) {
    await jogadores[0].send('atualiza')
    await jogadores[1].send('atualiza')
}

async function trataProxima(idJogo) {
    //incrementa
    await fetch(`http://localhost:3000/api/game/${idJogo}/question/`, { method: "POST" })

}

function getGameID(ws) {
    for (let i = 0; i < allGamesArray.length; i++) {
        if (allGamesArray[i].jogadores.includes(ws)) {
            console.log("encontrei o jogo")
            return allGamesArray[i].idJogo
        }
    }
}

function getPlayersStart() {
    const jogadoresArray = JogadoresEmEspera.slice(0, 2)
    JogadoresEmEspera = JogadoresEmEspera.slice(2)
    return jogadoresArray
}

function getPlayers(ws) {
    for (let i = 0; i < allGamesArray.length; i++) {
        if (allGamesArray[i].jogadores.includes(ws)) {
            console.log("encontrei o jogo")
            return allGamesArray[i].jogadores
        }
    }
}


async function createGame() {
    //ganda festival
    //perguntar ao fernando
    try {
        const idSerial = await fetch("http://localhost:3000/api/game/", { method: "POST" })
        const id = await idSerial.json()

        return id.id

    } catch (error) {
        console.log(error)
    }

    // let id = undefined
    //     .then(res => res.json())
    //     .then(data => id = data)
    //     .then(() => id)

}