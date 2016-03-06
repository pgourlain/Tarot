'use strict';

import React, {Component} from 'react';
import Card from './Card';
import Nom from './Nom';
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
            return <div key={i} className="stackinline">
                Joueur <Nom nom={jeu.nomJoueurs[i]}/>:{" "}
                <CardStack className="smallstack" cartes={cartesJoueur}/>
            </div>
        });

        const plisFait = jeu.pliFait.map((pli, i) => {
            if (pli.length > 0) {
                return <div key={i} className="stackinline">
                    Plis joueur <Nom nom={jeu.nomJoueurs[i]}/>:{" "}
                    <CardStack className="smallstack" cartes={pli}/>
                </div>;
            } else {
                return <div/>;
            }
        });

        let status;
        if (jeu.etat == Etats.JEU) {
            if (jeu.tourDe == this.props.moi) {
                status = <b>Choisi une de tes cartes!</b>;
            } else {
                status = <span>C'est le tour de joueur <Nom nom={jeu.nomJoueurs[jeu.tourDe]}/>. </span>;
            }
        } else if (jeu.etat == Etats.COUPER) {
            if (jeu.coupDe == this.props.moi) {
                status = <b>Choisi le nombre de carte que tu veux couper!</b>;
            } else {
                status = <span>C'est à <Nom nom={jeu.nomJoueurs[jeu.coupDe]}/> de couper. </span>;
            }
        } else if (jeu.etat == Etats.QUI_PREND) {
            if (jeu.tourDe == this.props.moi) {
                status = <b>Est-ce que tu veux prendre?</b>;
            } else {
                status = <span>C'est le tour de joueur <Nom nom={jeu.nomJoueurs[jeu.tourDe]}/> à décider. </span>;
            }
        } else if (jeu.etat == Etats.APPELER_ROI) {
            if (jeu.preneur == this.props.moi) {
                status = <b>Appelle un roi!</b>;
            } else {
                status = <span>C'est à <Nom nom={jeu.nomJoueurs[jeu.preneur]}/> de choisir un roi. </span>;
            }
        }

        return <div>
            Tu es le joueur <Nom nom={jeu.nomJoueurs[this.props.moi]}/><br/>
            {jeu.preneur !== null ? <span>Joueur <Nom nom={jeu.nomJoueurs[jeu.preneur]}/> a pris. </span> : ""}
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
                <Nom nom={jeu.pli.map((p, i) => jeu.nomJoueurs[(jeu.tourDe + jeu.joueurs - (jeu.pli.length) + i) % jeu.joueurs])}/>
            </div>
            <br/>
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
                    {jeu.resultat.map((r, i) => <div key={i}><Nom nom={jeu.nomJoueurs[i]}/>: {r}</div>)}
                    Le preneur <Nom nom={jeu.nomJoueurs[jeu.preneur]}/> a besoin de {jeu.pointsNecessaire}.<br/>
                    {jeu.preneurAGagne ? "Le preneur a gagné." : "Le preneur a perdu."}
                </div>
                : []}
        </div>;
    }
}
