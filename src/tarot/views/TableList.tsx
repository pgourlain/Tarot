import React from 'react';
import {Actions} from '../../datastructure/actions';
import { IJeu } from '../../interfaces/IJeu';


export interface ITableListProps {
    client: WebSocket | null;
    jeux: IJeu[];
}

export default class TableList extends React.Component<ITableListProps> {

    public render()
    {
        const jeux = this.props.jeux;
        const client = this.props.client;

        if (!jeux || !client) return '';
        return <div className="tableList">{jeux.reverse().map(jeu => <div className={'table ' + (jeu.active ? 'active' : 'joinable')} key={jeu.jeuId}>
        <div>
        {(!jeu.active) ? <div><button className="buttonCommand w100"
               onClick={() => client.send(JSON.stringify(Actions.makeJoindreJeu(jeu.uid)))}>
                   <i className="fas fa-sign-in-alt fa-2x"></i> <span>Rejoindre</span>
                   </button>
                   </div> : ''}

        {(!jeu.active) ? <div><button className="buttonCommand w100"
               onClick={() => client.send(JSON.stringify(Actions.makeSupprimerJeu(jeu.uid)))}>
            <i className="fas fa-trash-alt fa-2x"></i> <span>Supprimer</span>
                   </button></div> : ''}
        </div>
        <ul>
            {jeu.joueurs.map((joueur,i) => <li key={i}>{joueur}</li>)}
        </ul>
        </div>)}
        <div className="newTable">
            <input value="+" type="button"onClick={() =>  client.send(JSON.stringify(Actions.makeCreerJeu()))}>
            </input>
        </div>
    </div>
;
    }

}