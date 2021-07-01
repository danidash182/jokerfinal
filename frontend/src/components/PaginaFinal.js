import React from "react";
import "../css/pFinal.css";

class PaginaFinal extends React.Component {

    constructor(props) {
        super(props)

        this.state = {


        }
    }

    componentDidMount() {
        this.getScore(this.props.id)
    }

    getScore(id) {
        fetch(`/api/game/${id}/question/info`, { method: "GET" })
            .then(res => res.json())
            .then(res => this.setState((state) => ({
                aScore: res.aScore
            })))
    }

    render() { return (
        <div className="final-geral" style={{ backgroundImage: "url(vencedor.jpg)" }}>
            <div className="textos">
                <h1>Parabéns!</h1>
                <h2>Tiveste {this.state.aScore ? this.state.aScore : 0} pontos</h2>
            </div>
        </div>
    )}
}

export default PaginaFinal