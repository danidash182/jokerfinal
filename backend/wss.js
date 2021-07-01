import WebSocket from 'ws';
import * as fs from "fs";

const wss = new WebSocket.Server({ port: 8080 });

let JogadoresEmJogo = []
let JogadoresEmEspera = []

wss.on('connection', function connection(ws) {
    JogadoresEmEspera.push(ws);
    console.log("alguem entrou")
    console.log(JogadoresEmEspera.length)

    if (JogadoresEmEspera.length >= 2) {
        JogadoresEmJogo = [...JogadoresEmJogo].concat(JogadoresEmEspera.slice(0, 2))
        JogadoresEmEspera = JogadoresEmEspera.slice(2)
        console.log("---------------------------------")
        console.log("jogo comecado")
        console.log(JogadoresEmJogo.length)
    }

    ws.on('close', (ws) => {
        console.log("arregao")

    })
});