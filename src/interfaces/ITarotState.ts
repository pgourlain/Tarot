
import {ResponseJeu} from '../datastructure/responses';
import { IJeu } from './IJeu';

export interface ITarotState {
    chat_attendant: string;
    client: WebSocket | null;
    guid: string;
    jeu: ResponseJeu | null;
    joueurs: string[] | null;
    moi: number | null;
    nomJoueur: string;
    jeux: IJeu[];
}