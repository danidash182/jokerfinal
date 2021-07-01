import React from "react";
import "../css/pPergunta.css"
import ProgressBar from 'react-bootstrap/ProgressBar'
import 'bootstrap/dist/css/bootstrap.min.css';

class PaginaPerguntas extends React.Component {
    constructor(props) {
        super(props)


        this.state = {
            jaClicou: false,
            jaUsouJoker: false,
            quantosJokers: [true, true, true, true, true, true, true],
            options: [],
            paraApagar: "w",
            questionNr: 0
        }
        
        this.ws = new WebSocket('ws://localhost:8080')
    }

    //quando o componente monta, cria um jogo e 
    componentDidMount() {
        this.getQuestion(this.props.id)
        this.decrementaTempo()
    }


    //vai decrementar o tempo ao longo do tempo
    decrementaTempo() {
        setInterval(() => {
            if (Math.abs(this.state.cronometro - 1) < 0.01) this.getQuestion(this.props.id)
            this.setState((state) => ({
                cronometro: state.cronometro - 0.1
            }))
        }, 100);
    }

    //obtem uma pergunta e as respostas e define o resultado no state
    getQuestion(id) {
        console.log("incrementa pPerguntas")
        fetch(`/api/game/${id}/question`, { method: 'GET' })
            .then(res => res.json())
            .then(res => this.handleGetQuestion(res))
            .then(this.props.handler())
    }

    handleGetQuestion(res) {
        const initialOptions = res.opcoes
        let shuffledOptions = this.shuffleOptions(initialOptions)
        this.setState({
            question: res.pergunta,
            options: shuffledOptions,
            aScore: res.pontosA,
            bScore: res.pontosB,
            cronometro: res.tempo,
            jaUsouJoker: false,
            paraApagar: "w",
            questionNr: res.questionNr,
            certa: "n",
            respostaObtida: undefined,
            divisao: res.divisao
        })
    }

    //verifica se a resposta esta certa e obtem uma nova pergunta
    //e chamado quando se clica numa resposta
    check(resposta) {
        this.avoidMultiple()
        this.checkIfRight(resposta, this.props.id)
    }

    //nao deixa que o utilizador clique varias vezes
    avoidMultiple() {
        this.setState((state) => ({
            jaClicou: !state.jaClicou
        }))
        setTimeout(() => {
            this.setState((state) => ({
                jaClicou: !state.jaClicou
            }))
        }, 500);
    }

    //da fetch para verificar se esta certa ou nao e tratar dos pontos
    checkIfRight(resposta, id) {
        fetch(`/api/game/${id}/question`, {
            method: 'POST',
            body: JSON.stringify({ resposta }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(res => this.handleGetResult(res, resposta))
            .then(setTimeout(() => {
                this.getQuestion(this.props.id)
            }, 500))
    }

    handleGetResult(res, resposta) {
        this.setState({
            paraApagar: undefined,
            certa: res.rightAnswer,
            respostaObtida: resposta
        })
        this.playAudio(res.rightAnswer, resposta)
    }

    playAudio(rCerta, rObtida) {

        if (rCerta === rObtida) {
            this.playRightAudio()
        } else {
            this.playWrongAudio()
        }
    }

    playRightAudio() {
        const somCerto = document.getElementsByClassName("playRight")[0]
        somCerto.volume = 0.04
        somCerto.play()
    }
    playWrongAudio() {
        const somErrado = document.getElementsByClassName("playWrong")[0]
        somErrado.volume = 0.05
        somErrado.play()
    }

    useJoker(id) {
        if (!this.state.jaUsouJoker) {
            fetch(`/api/game/${id}/question/jokers`, { method: "PATCH" })
                .then(res => res.json())
                .then(res => this.setState((state) => ({
                    quantosJokers: res.jokers,
                    paraApagar: res.chave,
                    jaUsouJoker: !state.jaUsouJoker
                })))
        }
    }

    shuffleOptions(arrayInicial) {
        //copia do array
        let array = arrayInicial

        for (let i = arrayInicial.length - 1; i > 0; i--) {
            //gera um indice aleatorio do array
            const j = Math.floor(Math.random() * (i + 1));

            //troca o indice aleatorio pelo indice que estamos a iterar (que e uma recursao)
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }

    getAnswersClass(chaveOpcao) {
        //chave opcao vai se referir a key de uma resposta (todas pois isto e chamado dentro do map)
        console.log(this.state.certa);
        
        //se a chave for igual ao que o joker definiu para apagar, desativa essa opcao
        if (chaveOpcao === this.state.paraApagar) return " desativadoPorJoker"

        if (this.state.respostaObtida && this.state.respostaObtida !== this.state.certa && this.state.respostaObtida === chaveOpcao) {

            return " respostaErrada"
        }
        if (chaveOpcao === this.state.certa) {
            return " respostaCerta"
        } else return " "
    }

    render() {
        return (
            <div className="geral" style={{ backgroundImage: "url(background.jpg)" }}>
                <section className="jokers">
                    {
                        this.state.quantosJokers.map((e, i) => (

                            <button className="botaoJoker" key={i}>
                                <img className="mickey" src="mickey.png" alt=""
                                    onMouseOver={(e) => (e.currentTarget.src = "mickeypiscante.png")}
                                    onMouseOut={(e) => (e.currentTarget.src = "mickey.png")}
                                    onClick={() => this.useJoker(this.props.id)} />
                            </button>)
                        )

                    }
                </section>
                <section className="perguntasCaixa">
                    <section className="perguntas">
                        <p>{this.state.question}</p>
                        {
                            this.state.options.map(o => (
                                <button className={ "resposta" + this.getAnswersClass(o.key)} disabled={o.key === this.state.paraApagar || this.state.jaClicou} key={o.key} onClick={() => this.check(o.key)}>{o.text}</button>
                            ))
                        }
                        <p>{this.state.questionNr === 0 ? 1 : this.state.questionNr} / 25</p>
                    </section>
                    <section >
                        <ProgressBar  className={
                            this.state.cronometro < 15 ? "barraamarelo" : this.state.cronometro < 5 ? "barravermelho" : "barranormal"
                        } 
                        variant={this.state.cronometro < 5 ? "danger" : this.state.cronometro < 15 ? "warning" : "info"}
                        now={this.state.cronometro * 100 / this.state.divisao} />
                    </section>
                </section>
                <section>
                    <section className="jogadores">
                        <h2>Nosso herói</h2>
                        <h3>{this.state.aScore}</h3>
                    </section>
                    <section>
                    <audio className="playRight">
                        <source src="./8BitRight.mp3" ></source>
                    </audio>
                    <audio className="playWrong">
                        <source src="./8BitWrong.mp3" ></source>
                    </audio>
                </section>
                </section>
            </div>
        )
    }
}

export default PaginaPerguntas