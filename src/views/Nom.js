'use strict';

import React, {Component} from 'react';

export default class Nom extends Component {
    static defaultProps = {
        nom: [],
        divider: ", "
    };
    render() {
        const style = {display: "inline-block"};
        if (typeof this.props.nom === "string") {
            return <div style={style}>{this.props.nom}</div>;
        } else {
            return <span>{this.props.nom.map((nom, i, array) => <span key={i}>
                <div style={style}>{nom}</div>
                {i != array.length - 1 ? this.props.divider : ""}
            </span>)}</span>;
        }
    }
}