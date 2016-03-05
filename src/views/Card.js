'use strict';

import React, {Component} from 'react';
import Jeu from '../server/Jeu'

export default class Card extends Component {
    static propTypes = {
        card: React.PropTypes.string.isRequired,
        onClick: React.PropTypes.func
    };
    static defaultProps = {
        card: "--",
        onClick: null
    };
    state = {
    };
    render() {
        let card = this.props.card;
        if (card == "--") {
            return <img className="card" src="/tarot/img/back.gif" style={{width:"57px", height:"105px"}}/>;
        }
        let {row, column} = Card.findRowColumn(card);
        const style = {
            background: "url(/tarot/img/tarotcards.jpg)",
            backgroundPosition: (-57 * column) + "px " + (-105 * row) + "px",
            width: "57px",
            height: "105px"
        };
        return <div className="card" style={style} onClick={() => {if (this.props.onClick) this.props.onClick(this.props.card)}}/>;
    }

    static findRowColumn(card) {
        let row, column;
        switch (card.substring(0, 1)) {
            case "J":
                row = 1;
                column = 7;
                break;
            case "A":
                const atout = parseInt(card.substring(1));
                if (atout <= 14) {
                    row = 0;
                    column = atout - 1;
                } else {
                    row = 1;
                    column = atout - 15;
                }
                break;
            default:
                switch (card.substring(0, 1)) {
                    case "P":
                        row = 2;
                        break;
                    case "C":
                        row = 3;
                        break;
                    case "K":
                        row = 4;
                        break;
                    case "T":
                        row = 5;
                        break;
                }
                column = Jeu.cartesType[card.substring(1)];
                break;
        }
        return {row: row, column: column};
    }
}
