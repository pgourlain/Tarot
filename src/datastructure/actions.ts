import {Card} from '../enums/Card';

export type Action =
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
    { type: typeof Actions.SEND_MESSAGE, message: string };

export class Actions {
    public static readonly CARTE_CLICK = 'carteClick';
    public static readonly START = 'start';
    public static readonly REJOINDRE = 'rejoindre';
    public static readonly QUITTER = 'quitter';
    public static readonly COUPE = 'coupe';
    public static readonly JOINDRE = 'joindre';
    public static readonly PRENDS_PASSE = 'prendsPasse';
    public static readonly FAIRE_JEU = 'faireJeu';
    public static readonly FINI_FAIRE_JEU = 'finiFaireJeu';
    public static readonly QUITTER_JEU = 'quitterJeu';
    public static readonly PROCHAIN_JEU = 'prochainJeu';
    public static readonly SEND_MESSAGE = 'sendMessage';

    public static readonly makeCarteClick = (carte: Card) => ({type: Actions.CARTE_CLICK, carte});

    public static readonly makeStart = () => ({type: Actions.START});

    public static readonly makeRejoindre = (guid: string) => ({type: Actions.REJOINDRE, guid});

    public static readonly makeQuitter = () => ({type: Actions.QUITTER});

    public static readonly makeCoupe = (nombre: number) => ({type: Actions.COUPE, nombre});

    public static readonly makeJoindre = (guid: string, nomJoueur: string) => ({
        guid,
        nomJoueur,
        type: Actions.JOINDRE,
    })

    public static readonly makePrendsPasse = (prends: boolean) => ({type: Actions.PRENDS_PASSE, prends});

    public static readonly makeFaireJeu = (carte: Card) => ({type: Actions.FAIRE_JEU, carte});

    public static readonly makeFiniFaireJeu = () => ({type: Actions.FINI_FAIRE_JEU});

    public static readonly makeQuitterJeu = () => ({type: Actions.QUITTER_JEU});

    public static readonly makeProchainJeu = () => ({type: Actions.PROCHAIN_JEU});

    public static readonly makeSendMessage = (message: string) => ({type: Actions.SEND_MESSAGE, message});
}
