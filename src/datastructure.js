

export const Tarot = {
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


export const Actions = {
    CARTE_CLICK: "carteClick",
    makeCarteClick: (carte) => ({type: Actions.CARTE_CLICK, carte}),

    START: "start",
    makeStart: () => ({type: Actions.START}),

    REJOINDRE: "rejoindre",
    makeRejoindre: (guid) => ({type: Actions.REJOINDRE, guid}),

    QUITTER: "quitter",
    makeQuitter: () => ({type:Actions.QUITTER}),

    COUPE: "coupe",
    makeCoupe: (nombre) => ({type: Actions.COUPE, nombre}),

    JOINDRE: "joindre",
    makeJoindre: (guid, nomJoueur) => ({type: Actions.JOINDRE, guid, nomJoueur}),

    PRENDS_PASSE: "prendsPasse",
    makePrendsPasse: (prends) => ({type: Actions.PRENDS_PASSE, prends}),

    FAIRE_JEU: "faireJeu",
    makeFaireJeu: (carte) => ({type: Actions.FAIRE_JEU, carte}),

    FINI_FAIRE_JEU: "finiFaireJeu",
    makeFiniFaireJeu: () => ({type: Actions.FINI_FAIRE_JEU}),

    QUITTER_JEU: "quitterJeu",
    makeQuitterJeu: () => ({type: Actions.QUITTER_JEU}),

    PROCHAIN_JEU: "prochainJeu",
    makeProchainJeu: () => ({type: Actions.PROCHAIN_JEU}),

    SEND_MESSAGE: "sendMessage",
    makeSendMessage: (message) => ({type: Actions.SEND_MESSAGE, message})
};

export const ServerResponses = {
    JEU: "jeu",
    makeJeu: (jeu) => ({type: ServerResponses.JEU, jeu}),

    JOUEUR_JOINT: "joueurJoint",
    makeJoueurJoint: (joueurs, guids, chat_attendant) => ({type: ServerResponses.JOUEUR_JOINT, joueurs, guids, chat_attendant}),

    REJOINDU: "rejoindu",
    makeRejoindu: (moi, joueurs) => ({type: ServerResponses.REJOINDU, moi, joueurs})
};
