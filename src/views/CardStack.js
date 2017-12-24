'use strict';

import React, {Component} from 'react'
import Proptypes from 'prop-types'

import Card from './Card'

export default class CardStack extends Component {
    static propTypes = {
        cartes: Proptypes.array.isRequired,
        onClick: Proptypes.func
    };
    static defaultProps = {
        cartes: [],
        onClick: null
    };
    render() {
        const {cartes, onClick, ...forwardProps} = this.props;
        const cardStack = cartes.map((carte, i) => <Card key={carte == "--" ? i : carte} card={carte} onClick={onClick}/>);
        return <div {...forwardProps}>
            {cardStack}
        </div>;
    }
}
