import {Card} from "./enums/Card";
import {IData} from "./interfaces/IData";

export const Tarot: { cartes: Card[] } = {
    cartes: []
};

["C", "K", "P", "T"].forEach(color => {
    for (let i = 1; i <= 10; i++) {
        Tarot.cartes.push(color + i);
    }
    Tarot.cartes.push(color + "V");
    Tarot.cartes.push(color + "C");
    Tarot.cartes.push(color + "D");
    Tarot.cartes.push(color + "R");
});
for (let i = 1; i <= 21; i++) {
    Tarot.cartes.push("A" + i);
}
Tarot.cartes.push("J");

export type MessageAction =
    { type: typeof Actions.CARTE_CLICK, carte: Card } |
    { type: typeof Actions.START } |
    { type: typeof Actions.REJOINDRE, guid: string } |
    { type: typeof Actions.QUITTER } |
    { type: typeof Actions.COUPE, nombre: number } |
    { type: typeof Actions.JOINDRE, guid: string, nomJoueur: string } |
    { type: typeof Actions.PRENDS_PASSE, prends: boolean } |
    { type: typeof Actions.FAIRE_JEU, carte: Card } |
    { type: typeof Actions.FINI_FAIRE_JEU } |
    { type: typeof Actions.QUITTER_JEU } |
    { type: typeof Actions.PROCHAIN_JEU } |
    { type: typeof Actions.SEND_MESSAGE, message: string }

export class Actions {
    public static readonly CARTE_CLICK = "carteClick"
    public static readonly makeCarteClick = (carte: Card) => ({type: Actions.CARTE_CLICK, carte})

    public static readonly START = "start"
    public static readonly makeStart = () => ({type: Actions.START})

    public static readonly REJOINDRE = "rejoindre"
    public static readonly makeRejoindre = (guid: string) => ({type: Actions.REJOINDRE, guid})

    public static readonly QUITTER = "quitter"
    public static readonly makeQuitter = () => ({type: Actions.QUITTER})

    public static readonly COUPE = "coupe"
    public static readonly makeCoupe = (nombre: number) => ({type: Actions.COUPE, nombre})

    public static readonly JOINDRE = "joindre"
    public static readonly makeJoindre = (guid: string, nomJoueur: string) => ({type: Actions.JOINDRE, guid, nomJoueur})

    public static readonly PRENDS_PASSE = "prendsPasse"
    public static readonly makePrendsPasse = (prends: boolean) => ({type: Actions.PRENDS_PASSE, prends})

    public static readonly FAIRE_JEU = "faireJeu"
    public static readonly makeFaireJeu = (carte: Card) => ({type: Actions.FAIRE_JEU, carte})

    public static readonly FINI_FAIRE_JEU = "finiFaireJeu"
    public static readonly makeFiniFaireJeu = () => ({type: Actions.FINI_FAIRE_JEU})

    public static readonly QUITTER_JEU = "quitterJeu"
    public static readonly makeQuitterJeu = () => ({type: Actions.QUITTER_JEU})

    public static readonly PROCHAIN_JEU = "prochainJeu"
    public static readonly makeProchainJeu = () => ({type: Actions.PROCHAIN_JEU})

    public static readonly SEND_MESSAGE = "sendMessage"
    public static readonly makeSendMessage = (message: string) => ({type: Actions.SEND_MESSAGE, message})
}

export type MessageResponse =
    { type: typeof ServerResponses.JEU; jeu: IData | null } |
    { type: typeof ServerResponses.JOUEUR_JOINT; joueurs: string[]; guids: string[]; chat_attendant: string } |
    { type: typeof ServerResponses.REJOINDU; moi: number }

export class ServerResponses {
    public static readonly JEU = "jeu" as "jeu"
    public static readonly makeJeu = (jeu: IData | null) => ({type: ServerResponses.JEU, jeu})

    public static readonly JOUEUR_JOINT = "joueurJoint" as "joueurJoint"
    public static readonly makeJoueurJoint = (joueurs: string[], guids: string[], chat_attendant: string) => ({
        type: ServerResponses.JOUEUR_JOINT,
        joueurs,
        guids,
        chat_attendant
    })

    public static readonly REJOINDU = "rejoindu"
    public static readonly makeRejoindu = (moi: number) => ({type: ServerResponses.REJOINDU, moi})
};
