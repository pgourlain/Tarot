import * as fs from 'fs';

import {Actions, MessageAction, ServerResponses} from '../datastructure'
import Jeu from './Jeu'
import {IData} from "../interfaces/IData";
import {connection} from "websocket";

interface ISavedGame {
    jeux: { jeuData: IData, guids: string[] }[];
    known_guids: { [guid: string]: { jeuId: number, joueur: number } };
    joueur_attendant: { guid: string, nomJoueur: string }[];
    chat_attendant: string;
}

const jeux: Jeu[] = [];

let known_guids: { [guid: string]: { jeu: Jeu, joueur: number } } = {};

let joueur_attendant: { guid: string, connection?: connection, nomJoueur: string, startCallback?: () => void | null }[] = [];
let chat_attendant = "";

export function save(file: string, callback: () => void) {
    const saved_known_guids: ISavedGame["known_guids"] = {};
    for (let guid in known_guids) {
        if (known_guids.hasOwnProperty(guid)) {
            saved_known_guids[guid] = {
                jeuId: jeux.findIndex(j => j === known_guids[guid].jeu),
                joueur: known_guids[guid].joueur,
            }
        }
    }
    const data: ISavedGame = {
        jeux: jeux.map(jeu => ({jeuData: jeu.data, guids: jeu.guids})),
        known_guids: saved_known_guids,
        joueur_attendant: joueur_attendant.map(j => ({...j, startCallback: null, connection: null})),
        chat_attendant
    };
    fs.writeFile(file, JSON.stringify(data), (err) => {
        if (err) throw err;
        if (callback) callback();
    });
}

export function open(file: string, callback?: () => void) {
    fs.readFile(file, (err, content) => {
        if (!err) {
            const data: ISavedGame = JSON.parse(content.toString());
            data.jeux.forEach(({jeuData, guids}) => jeux.push(new Jeu(jeuData, guids)));
            const loaded_known_guids: typeof known_guids = {};
            for (let guid in data.known_guids) {
                if (data.known_guids.hasOwnProperty(guid)) {
                    loaded_known_guids[guid] = {
                        jeu: jeux[data.known_guids[guid].jeuId],
                        joueur: data.known_guids[guid].joueur,
                    }
                }
            }
            known_guids = loaded_known_guids;
            joueur_attendant = data.joueur_attendant;
            chat_attendant = data.chat_attendant;
        }
        if (callback) callback();
    });
}

export function createActionHandler(connection: connection) {
    let jeu: Jeu | null = null;
    let guid: string | null = null;
    let moi: number | null = null;
    return (m: MessageAction) => {
        if (jeu && jeu.invalid) {
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

                const nomJoueur = m.nomJoueur.substring(0, 50).replace(/,/g, " ");
                if (joueur_attendant.findIndex(j => j.nomJoueur == nomJoueur) !== -1) {
                    console.log("player name already exists");
                    // TODO error
                    return;
                }
                const newGuid = m.guid;
                joueur_attendant.push({
                    guid: newGuid, connection, nomJoueur: nomJoueur, startCallback: () => {
                        jeu = known_guids[newGuid].jeu;
                        moi = joueur_attendant.findIndex(j => j.guid == newGuid);
                    }
                });
                guid = newGuid;
                joueur_attendant.forEach(({connection}) => sendJoueurs(connection));
                break;
            case Actions.REJOINDRE: {
                const index = joueur_attendant.findIndex(j => j.guid == m.guid);
                if (index != -1) {
                    const newGuid = m.guid;
                    joueur_attendant[index].connection = connection;
                    joueur_attendant[index].startCallback = () => {
                        jeu = known_guids[newGuid].jeu;
                        moi = joueur_attendant.findIndex(j => j.guid == newGuid);
                    };
                    guid = newGuid;
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
                const newJeu = Jeu.creeNouveauJeu(getNomJoueurs());
                jeux.push(newJeu);
                joueur_attendant.forEach(({guid: joueur_guid, connection}, i) => {
                    known_guids[joueur_guid] = {jeu: newJeu, joueur: i};
                    if (connection != null) {
                        newJeu.connections[i] = connection;
                    }
                    newJeu.guids.push(joueur_guid);
                });
                joueur_attendant.forEach(({startCallback}, i) => {
                    if (startCallback != null) {
                        startCallback();
                    }
                });
                joueur_attendant = [];
                newJeu.data.chat = chat_attendant;
                chat_attendant = "";
                sendToAll(newJeu);
                jeu = newJeu;
                break;
            case Actions.COUPE:
                if (!jeu) {
                    console.warn("Action non permis, jeu pas commencé");
                    return;
                }
                jeu.coupe(m.nombre);
                sendToAll(jeu);
                jeu.distribue(() => {
                    if (!jeu) {
                        return;
                    }
                    sendToAll(jeu);
                });
                break;
            case Actions.PRENDS_PASSE:
                if (!jeu || moi === null) {
                    console.warn("Action non permis, jeu pas commencé");
                    return;
                }
                jeu.jePrendsPasse(moi, m.prends, () => {
                    if (!jeu) {
                        return;
                    }
                    sendToAll(jeu);
                });
                break;
            case Actions.CARTE_CLICK:
                if (!jeu || moi === null) {
                    console.warn("Action non permis, jeu pas commencé");
                    return;
                }
                jeu.carteClick(moi, m.carte, () => {
                    if (!jeu) {
                        return;
                    }
                    sendToAll(jeu);
                });
                break;
            case Actions.FINI_FAIRE_JEU:
                if (!jeu || moi === null) {
                    console.warn("Action non permis, jeu pas commencé");
                    return;
                }
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
                if (jeu !== null && moi !== null) {
                    jeu.data.chat = getChatMessage(jeu.data.nomJoueurs[moi], m.message) + jeu.data.chat;
                    sendToAll(jeu);
                } else if (guid) {
                    const joueur = joueur_attendant.find(j => j.guid == guid);
                    if (!joueur) {
                        return
                    }
                    chat_attendant = getChatMessage(joueur.nomJoueur, m.message) + chat_attendant;
                    joueur_attendant.forEach(({connection}) => sendJoueurs(connection));
                }
                break;
        }
    };

    function getChatMessage(name: string, message: string) {
        return new Date().toTimeString().substring(0, 8) + " " + name + ": " + message.substring(0, 100).replace(/\n/g, " ") + "\n";
    }

    function getNomJoueurs() {
        return joueur_attendant.map(j => j.nomJoueur);
    }

    function sendJoueurs(con?: connection) {
        if (!con) {
            return
        }
        con.sendUTF(JSON.stringify(ServerResponses.makeJoueurJoint(getNomJoueurs(), joueur_attendant.map(j => j.guid), chat_attendant)));
    }
}

export function sendToAll(jeu: Jeu) {
    jeu.connections.forEach((connection, moi) => {
        const data = {...jeu.anonymize(moi), moi};
        connection.sendUTF(JSON.stringify(ServerResponses.makeJeu(data)));
    });
}
