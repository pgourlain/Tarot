'use strict';

import * as React from 'react'
import {Component} from 'react'

import Card from './Card'
import {Card as CardEnum} from "../enums/Card";

export interface ICardStackProps {
    cartes: CardEnum[];
    onClick?: (card: CardEnum) => void;
    className?: string;
}

export default class CardStack extends Component<ICardStackProps> {
    static defaultProps: ICardStackProps = {
        cartes: [],
    };

    render() {
        const {cartes, onClick, ...forwardProps} = this.props;
        const cardStack = cartes.map((carte, i) => <Card key={carte == "--" ? i : carte} card={carte}
                                                         onClick={onClick}/>);
        return <div {...forwardProps}>
            {cardStack}
        </div>;
    }
}
