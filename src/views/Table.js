'use strict';

import React, {Component} from 'react';
import Card from './Card';
import CardStack from './CardStack';
import {Etats} from '../server/Jeu'

export default class Table extends Component {
    static propTypes = {
        jeu: React.PropTypes.object.isRequired,
        moi: React.PropTypes.number.isRequired,
        onCouper: React.PropTypes.func.isRequired,
        onPlayCard: React.PropTypes.func.isRequired,
        onPrendsPasse: React.PropTypes.func.isRequired,
        onFiniFaireJeu: React.PropTypes.func.isRequired
    };
    static defaultProps = {
    };
    state = {
        couperA: 0
    };
    render() {
        const jeu = this.props.jeu;
        const cartes = jeu.cartesJoueurs.map((cartesJoueur, i) => {
            if (i == this.props.moi) {
                return <span key={i}/>
            }
            return <div key={i} style={{display: "inline-block"}}>
                Joueur {jeu.nomJoueurs[i]}:
                <CardStack className="smallstack" cartes={cartesJoueur}/>
            </div>
        });

        const plisFait = jeu.pliFait.map((pli, i) => {
            return <div key={i} style={{display: "inline-block"}}>
                Plis joueur {jeu.nomJoueurs[i]}:
                <CardStack className="smallstack" cartes={pli}/>
            </div>;
        });

        let status;
        if (jeu.etat == Etats.JEU) {
            if (jeu.tourDe == this.props.moi) {
                status = <b>Choisi une de tes cartes!</b>;
            } else {
                status = "C'est le tour de joueur " + jeu.nomJoueurs[jeu.tourDe] + ". ";
            }
        } else if (jeu.etat == Etats.COUPER) {
            if (jeu.coupDe == this.props.moi) {
                status = <b>Choisi le nombre de carte que tu veux couper!</b>;
            } else {
                status = "C'est à " + jeu.nomJoueurs[jeu.coupDe] + " de couper. ";
            }
        } else if (jeu.etat == Etats.QUI_PREND) {
            if (jeu.tourDe == this.props.moi) {
                status = <b>Est-ce que tu veux prendre!</b>;
            } else {
                status = "C'est le tour de joueur " + jeu.nomJoueurs[jeu.tourDe] + " à décider. ";
            }
        } else if (jeu.etat == Etats.APPELER_ROI) {
            if (jeu.preneur == this.props.moi) {
                status = <b>Appelle un roi!</b>;
            } else {
                status = "C'est à " + jeu.nomJoueurs[jeu.preneur] + " de choisir un roi. ";
            }
        }

        return <div>
            Tu es joueur {jeu.nomJoueurs[this.props.moi]}!
            {jeu.preneur !== null ? " Joueur " + jeu.nomJoueurs[jeu.preneur] + " a pris. " : ""}
            {jeu.roiAppele !== null ? " Il a appele le roi de " + {"PR": "pique", "KR": "carreau", "TR": "trèfle", "CR": "cœur"}[jeu.roiAppele] + ". ": ""}
            <br/>
            <br/>
            {status}
             {jeu.coupDe == this.props.moi ?
                <div>
                    <input type="text" value={this.state.couperA} onChange={(e) => this.setState({couperA: Math.min(jeu.cartes.length, Math.max(0, e.target.value))})}/>
                    <input type="button" value="Couper" onClick={() => this.props.onCouper(this.state.couperA)}/>
                </div>
            :""}
            {jeu.etat == Etats.QUI_PREND && jeu.tourDe == this.props.moi ?
                <div>
                    <input type="button" value="Je prends" onClick={() => this.props.onPrendsPasse(true)}/>
                    <input type="button" value="Je passe" onClick={() => this.props.onPrendsPasse(false)}/>
                </div>
                :""}
            {jeu.etat == Etats.FAIRE_JEU && jeu.preneur == this.props.moi ?
                <input type="button" value="Fini faire mon jeu" onClick={() => this.props.onFiniFaireJeu()}/>
                :""}
            <br/>
            <br/>
            <div>
                Pli:
                <CardStack className="stack" cartes={jeu.pli}/>
            </div>
            {jeu.etat == Etats.APPELER_ROI ?
                <CardStack cartes={["PR", "KR", "TR", "CR"]} onClick={(card) => this.props.onPlayCard(card)}/>
                :""}
            {jeu.chien.length != 0 ?
                <div>
                    Chien:
                    <CardStack cartes={jeu.chien} onClick={(card) => this.props.onPlayCard(card)}/>
                </div>
                :""}
            {this.props.moi == null ? "" :
                <div>
                    Mes cartes:
                    <CardStack className="stack"  cartes={jeu.cartesJoueurs[this.props.moi]} onClick={(card) => this.props.onPlayCard(card)}/>
                </div>
            }
            {cartes}
            <br/>
            {plisFait}
            {jeu.resultat !== null ?
                <div>
                    {jeu.resultat.map((r, i) => <div key={i}>{jeu.nomJoueurs[i] + ": " + r}</div>)}
                    Le preneur {jeu.nomJoueurs[jeu.preneur]} a besoin de {jeu.pointsNecessaire}.
                </div>
                : []}
        </div>;
    }
}
