import {IData} from '../interfaces/IData';

export type ServerResponse =
    { type: typeof ServerResponses.JEU; jeu: ResponseJeu | null, moi: number } |
    { type: typeof ServerResponses.JOUEUR_JOINT; joueurs: string[]|null; jeux: {jeuId: number, active: boolean, joueurs: string[]}[]; chat_attendant: string } |
    { type: typeof ServerResponses.REJOINDU; };

export interface ResponseJeu extends IData {
    nomJoueurs: string[];
}
export class ServerResponses {
    public static readonly JEU = 'jeu' as 'jeu';
    public static readonly JOUEUR_JOINT = 'joueurJoint' as 'joueurJoint';
    public static readonly REJOINDU = 'rejoindu';

    public static readonly makeJeu = (jeu: ResponseJeu | null, moi: number) => ({type: ServerResponses.JEU, jeu, moi});

    public static readonly makeJoueurJoint = (joueurs: string[]|null, jeux: {jeuId: number, active: boolean, joueurs: string[]}[], chatAttendant: string) => ({
        type: ServerResponses.JOUEUR_JOINT,
        chat_attendant: chatAttendant,
        joueurs,
        jeux,
    });

    public static readonly makeRejoindu = () => ({type: ServerResponses.REJOINDU});
}
