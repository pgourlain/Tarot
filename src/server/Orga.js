
import fs from 'fs';

import {Actions, ServerResponses} from '../datastructure'
import Jeu from './Jeu'

const jeux = [];

let known_guids = {}; // uid -> jeu, joueur

let joueur_attendant = [];// guid, startCallback, connection
let chat_attendant = "";

export function save(file, callback) {
    const data = {
        jeux: jeux.map(jeu => ({jeuData: jeu.data, guids: jeu.guids})),
        known_guids,
        joueur_attendant: joueur_attendant.map(j => ({...j, startCallback: null, connection: null})),
        chat_attendant
    };
    for (let guid in known_guids) {
        if (known_guids.hasOwnProperty(guid)) {
            known_guids[guid].jeuId = jeux.findIndex(j => j === known_guids[guid].jeu);
            delete known_guids[guid].jeu;
        }
    }
    fs.writeFile(file, JSON.stringify(data), (err) => {
        if (err) throw err;
        if (callback) callback();
    });
}

export function open(file, callback) {
    fs.readFile(file, (err, content) => {
        if (!err) {
            const data = JSON.parse(content);
            data.jeux.forEach(({jeuData, guids}) => jeux.push(new Jeu(jeuData, guids)));
            known_guids = data.known_guids;
            for (let guid in known_guids) {
                if (known_guids.hasOwnProperty(guid)) {
                    known_guids[guid].jeu = jeux[known_guids[guid].jeuId];
                }
            }
            joueur_attendant = data.joueur_attendant;
            chat_attendant = data.chat_attendant;
        }
        if (callback) callback();
    });
}

export function createActionHandler(connection) {
    let jeu = null;
    let guid = null;
    let moi = null;
    return (m) => {
        if (jeu && "invalid" in jeu) {
            jeu = null;
            moi = null;
        }
        switch (m.type) {
            case Actions.JOINDRE:
                if (joueur_attendant.length >= 5) {
                    console.log("too many players");
                    //TODO error
                    return;
                }

                const nomJoueur = m.nomJoueur.substring(0, 50);
                if (joueur_attendant.findIndex(j => j.nomJoueur == nomJoueur) !== -1) {
                    // TODO error
                    return;
                }
                guid = m.guid;
                joueur_attendant.push({guid, connection, nomJoueur: nomJoueur, startCallback: () => {
                    jeu = known_guids[guid].jeu;
                    moi = joueur_attendant.findIndex(j => j.guid == guid);
                }});
                joueur_attendant.forEach(({connection}) => sendJoueurs(connection));
                break;
            case Actions.REJOINDRE: {
                const index = joueur_attendant.findIndex(j => j.guid == m.guid);
                if (index != -1) {
                    guid = m.guid;
                    joueur_attendant[index].connection = connection;
                    joueur_attendant[index].startCallback = () => {
                        jeu = known_guids[guid].jeu;
                        moi = joueur_attendant.findIndex(j => j.guid == guid);
                    };
                    sendJoueurs(connection);
                } else if (m.guid in known_guids) {
                    guid = m.guid;
                    moi = known_guids[guid].joueur;
                    jeu = known_guids[guid].jeu;
                    jeu.connections[moi] = connection;
                    connection.sendUTF(JSON.stringify(ServerResponses.makeRejoindu(moi)));
                    sendToAll(jeu);
                } else {
                    //TODO error
                    return;
                }
                break;
            }
            case Actions.QUITTER: {
                const index = joueur_attendant.findIndex(j => j.guid == guid);
                if (index == -1) return;
                joueur_attendant.splice(index, 1);
                joueur_attendant.forEach(({connection}) => sendJoueurs(connection));
                sendJoueurs(connection);
                break;
            }
            case Actions.START:
                if (joueur_attendant.length < 3) {
                    console.log("not enough player");
                    //TODO error
                    return;
                }
                jeu = Jeu.creeNouveauJeu(getNomJoueurs());
                jeux.push(jeu);
                joueur_attendant.forEach(({guid:joueur_guid, connection}, i) => {
                    known_guids[joueur_guid] = {jeu, joueur: i};
                    if (connection != null) {
                        jeu.connections[i] = connection;
                    }
                    jeu.guids.push(joueur_guid);
                });
                joueur_attendant.forEach(({startCallback}, i) => {
                    if (startCallback != null) {
                        startCallback();
                    }
                });
                joueur_attendant = [];
                jeu.data.chat = chat_attendant;
                chat_attendant = "";
                sendToAll(jeu);
                break;
            case Actions.COUPE:
                jeu.coupe(m.nombre);
                sendToAll(jeu);
                jeu.distribue(() => {
                    sendToAll(jeu);
                });
                break;
            case Actions.PRENDS_PASSE:
                jeu.jePrendsPasse(moi, m.prends, () => sendToAll(jeu));
                break;
            case Actions.CARTE_CLICK:
                jeu.carteClick(moi, m.carte, () => sendToAll(jeu));
                break;
            case Actions.FINI_FAIRE_JEU:
                jeu.finiFaireJeu(moi);
                sendToAll(jeu);
                break;
            case Actions.QUITTER_JEU:
                if (jeu) {
                    jeu.guids.forEach(joueur_guid => {
                        delete known_guids[joueur_guid];
                    });
                    jeu.connections.forEach((connection) => {
                        connection.sendUTF(JSON.stringify(ServerResponses.makeJeu(null)));
                        sendJoueurs(connection);
                    });
                    jeux.splice(jeux.findIndex(j => j == jeu), 1);
                    jeu.invalid = true;
                }
                break;
            case Actions.PROCHAIN_JEU:
                if (jeu) {
                    jeu.prochainJeu();
                    sendToAll(jeu);
                }
                break;
            case Actions.SEND_MESSAGE:
                if (jeu) {
                    jeu.data.chat = getChatMessage(jeu.data.nomJoueurs[moi], m.message) + jeu.data.chat;
                    sendToAll(jeu);
                } else if (guid) {
                    chat_attendant = getChatMessage(joueur_attendant.find(j => j.guid == guid).nomJoueur, m.message) + chat_attendant;
                    joueur_attendant.forEach(({connection}) => sendJoueurs(connection));
                }
                break;
        }
    };

    function getChatMessage(name, message) {
        return new Date().toTimeString().substring(0, 8) + " " + name + ": " + message.substring(0, 100).replace("\n", " ") + "\n";
    }

    function getNomJoueurs() {
        return joueur_attendant.map(j => j.nomJoueur);
    }

    function sendJoueurs(con) {
        if (con !== null)
            con.sendUTF(JSON.stringify(ServerResponses.makeJoueurJoint(getNomJoueurs(), joueur_attendant.map(j => j.guid), chat_attendant)));
    }
}

export function sendToAll(jeu) {
    jeu.connections.forEach((connection, moi) => {
        const data = {...jeu.anonymize(moi), moi};
        connection.sendUTF(JSON.stringify(ServerResponses.makeJeu(data)));
    });
}
