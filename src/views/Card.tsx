'use strict';

import * as React from 'react';
import {Component} from 'react';
import Jeu from '../server/Jeu'
import {Card as CardEnum} from "../enums/Card";

export interface ICardProps {
    card: CardEnum;
    onClick?: (card: CardEnum) => void;
}

export default class Card extends Component<ICardProps> {
    static defaultProps: ICardProps = {
        card: "--",
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

    static findRowColumn(card: CardEnum): {row: number, column: number} {
        switch (card.substring(0, 1)) {
            case "J":
                return {
                    row: 1,
                    column: 7,
                };
            case "A":
                const atout = parseInt(card.substring(1));
                if (atout <= 14) {
                    return {
                        row: 0,
                        column: atout - 1,
                    };
                } else {
                    return {
                        row: 1,
                        column: atout - 15,
                    };
                }
            default:
                let row: number | undefined;
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
                    default:
                        throw new Error('Invalid card: ' + card)
                }
                return {
                    row: row,
                    column: Jeu.cartesType[card.substring(1)],
                };
        }
    }
}
