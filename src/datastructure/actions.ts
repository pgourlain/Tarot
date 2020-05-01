
export type Action =
    { type: typeof Actions.CREER_JEU } |
    { type: typeof Actions.SUPPRIMER_JEU, uid: string } |
    { type: typeof Actions.START } |
    { type: typeof Actions.REJOINDRE, guid: string } |
    { type: typeof Actions.QUITTER } |
    { type: typeof Actions.JOINDRE, guid: string, nomJoueur: string } |
    { type: typeof Actions.JOINDRE_JEU, uid: string } |
    { type: typeof Actions.ACTION, data: any } |
    { type: typeof Actions.QUITTER_JEU } |
    { type: typeof Actions.PROCHAIN_JEU } |
    { type: typeof Actions.SEND_MESSAGE, message: string };

export class Actions {
    public static readonly CREER_JEU = 'creerJeu';
    public static readonly SUPPRIMER_JEU = 'supprimerJeu';
    public static readonly START = 'start';
    public static readonly REJOINDRE = 'rejoindre';
    public static readonly QUITTER = 'quitter';
    public static readonly JOINDRE = 'joindre';
    public static readonly JOINDRE_JEU = 'joindreJeu';
    public static readonly ACTION = 'action';
    public static readonly QUITTER_JEU = 'quitterJeu';
    public static readonly PROCHAIN_JEU = 'prochainJeu';
    public static readonly SEND_MESSAGE = 'sendMessage';

    public static readonly makeCreerJeu = () => ({type: Actions.CREER_JEU});
    public static readonly makeSupprimerJeu = (uid : string) => ({type: Actions.SUPPRIMER_JEU, uid});

    public static readonly makeStart = () => ({type: Actions.START});

    public static readonly makeRejoindre = (guid: string) => ({type: Actions.REJOINDRE, guid});

    public static readonly makeQuitter = () => ({type: Actions.QUITTER});

    public static readonly makeJoindre = (guid: string, nomJoueur: string) => ({guid, nomJoueur, type: Actions.JOINDRE});

    public static readonly makeJoindreJeu = (uid: string) => ({type: Actions.JOINDRE_JEU, uid});

    public static readonly makeAction = (data: any) => ({type: Actions.ACTION,data});

    public static readonly makeQuitterJeu = () => ({type: Actions.QUITTER_JEU});

    public static readonly makeProchainJeu = () => ({type: Actions.PROCHAIN_JEU});

    public static readonly makeSendMessage = (message: string) => ({type: Actions.SEND_MESSAGE, message});
}
