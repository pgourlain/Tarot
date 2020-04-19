import {Card} from '../tarot/enums/Card';
import {Etats} from '../tarot/Jeu';

export interface IData {
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
