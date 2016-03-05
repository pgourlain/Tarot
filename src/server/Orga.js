
import fs from 'fs';

import {Actions, ServerResponses} from '../datastructure'
import Jeu from './Jeu'

const jeux = [];

let known_guids = {}; // uid -> jeu, joueur

let joueur_attendant = [];// guid, startCallback, connection

export function save(file, callback) {
    const data = {
        jeux: jeux.map(jeu => ({jeuData: jeu.data, guids: jeu.guids})),
        known_guids,
        joueur_attendant: joueur_attendant.map(j => ({...j, startCallback: null, connection: null}))
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
        }
        if (callback) callback();
    });
}

export function createActionHandler(connection) {
    let jeu = null;
    let guid = null;
    let moi = null;
    return (m) => {
        switch (m.type) {
            case Actions.JOINDRE:
                if (joueur_attendant.length >= 5) {
                    console.log("too many players");
                    //TODO error
                    return;
                }
                if (joueur_attendant.findIndex(j => j.nomJoueur == m.nomJoueur) !== -1) {
                    // TODO error
                    return;
                }
                guid = m.guid;
                joueur_attendant.push({guid, connection, nomJoueur: m.nomJoueur, startCallback: () => {
                    jeu = known_guids[guid].jeu;
                    moi = joueur_attendant.findIndex(j => j.guid == guid);
                }});
                joueur_attendant.forEach(({connection}) => {
                    if (connection !== null)
                        connection.sendUTF(JSON.stringify(ServerResponses.makeJoueurJoint(getNomJoueurs())));
                });
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
                    connection.sendUTF(JSON.stringify(ServerResponses.makeRejoindu(null, getNomJoueurs())));
                } else if (m.guid in known_guids) {
                    guid = m.guid;
                    moi = known_guids[guid].joueur;
                    jeu = known_guids[guid].jeu;
                    jeu.connections[moi] = connection;
                    connection.sendUTF(JSON.stringify(ServerResponses.makeRejoindu(moi, getNomJoueurs())));
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
                joueur_attendant.forEach(({connection:jConnection}) => {
                    if (jConnection !== null)
                        jConnection.sendUTF(JSON.stringify(ServerResponses.makeJoueurJoint(getNomJoueurs())));
                });
                connection.sendUTF(JSON.stringify(ServerResponses.makeJoueurJoint(getNomJoueurs())));
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
                jeu.guids.forEach((joueur_guid) => {
                    delete known_guids[joueur_guid];
                });
                jeu.connections.forEach((connection) => {
                    connection.sendUTF(JSON.stringify(ServerResponses.makeJeu(null)));
                    connection.sendUTF(JSON.stringify(ServerResponses.makeJoueurJoint([])));
                });
                jeux.splice(jeux.findIndex(j => j == jeu), 1);
                break;
            case Actions.PROCHAIN_JEU:
                console.log(jeu);
                jeu.prochainJeu();
                sendToAll(jeu);
                break;
        }
    };
    function getNomJoueurs() {
        return joueur_attendant.map(j => j.nomJoueur);
    }
}

export function sendToAll(jeu) {
    jeu.connections.forEach((connection, moi) => {
        const data = {...jeu.anonymize(moi), moi};
        connection.sendUTF(JSON.stringify(ServerResponses.makeJeu(data)));
    });
}
