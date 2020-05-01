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
        <ul>
            {jeu.joueurs.map((joueur,i) => <li key={i}>{joueur}</li>)}
        </ul>
        {(!jeu.active) ? <div><input type="button" value="Rejoindre cette table"
               onClick={() => client.send(JSON.stringify(Actions.makeJoindreJeu(jeu.uid)))}/></div> : ''}

        {(!jeu.active) ? <div><input type="button" value="Supprimer cette table"
               onClick={() => client.send(JSON.stringify(Actions.makeSupprimerJeu(jeu.uid)))}/></div> : ''}
        </div>)}
        <div className="newTable">
            <input value="+" type="button"onClick={() =>  client.send(JSON.stringify(Actions.makeCreerJeu()))}>
            </input>
        </div>
    </div>
;
    }

}