import {Card} from '../enums/Card';
import {Etats} from '../server/Jeu';

export interface IData {
    nomJoueurs: string[];
    joueurs: number;
    premierTourDe: number;
    cartes: Card[];
    cartesJoueurs: Card[][];
    chien: Card[];
    pli: Card[];
    pliFait: Card[][]; // par joueur
    etat: Etats;
    chat: string;
    tourDe: number;
    coupDe: number | null;
    reponsePrisePasse: number;
    preneur: number | null;
    roiAppele: Card | null;
    joueurAvecRoi: number | null;
    dernierPli: Card[];
    excuseDe: number | null;
    excusePliFaitPar: number | null;
    resultat: number[] | null;
    pointsNecessaire: number | null;
    preneurAGagne: boolean | null;
}
