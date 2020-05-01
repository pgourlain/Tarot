import {readFile, writeFile} from 'fs';
import {connection as WebsocketConnection, connection} from 'websocket';
import {Action, Actions} from '../datastructure/actions';
import {ServerResponses} from '../datastructure/responses';
import {IData} from '../interfaces/IData';
import Jeu, {Etats} from '../tarot/Jeu';
import { IJeu } from '../interfaces/IJeu';

interface ISavedGame {
    jeux: { jeuData: IData|null, guids: string[] }[];
    known_guids: { [guid: string]: { jeuId: number, nom: string } };
    chat_attendant: string;
}

interface IKnownGuid {
    jeu: Jeu | null, nom: string;
    connection: WebsocketConnection | null;
}

const jeux: (Jeu|null)[] = [];

let knownGuids: { [guid: string]: IKnownGuid } = {};

let chatAttendant = '';

export function save(file: string, callback: () => void) {
    const savedKnownGuids: ISavedGame['known_guids'] = {};
    for (const guid in knownGuids) {
        if (knownGuids.hasOwnProperty(guid)) {
            const jeuId = jeux.findIndex(j => j === knownGuids[guid].jeu);
            savedKnownGuids[guid] = {
                jeuId,
                nom: knownGuids[guid].nom,
            };
        }
    }
    const data: ISavedGame = {
        chat_attendant: chatAttendant,
        jeux: jeux.map(jeu => ({jeuData: (jeu ? jeu.data : null), guids: (jeu ? jeu.guids : [])})),
        known_guids: savedKnownGuids,
    };
    writeFile(file, JSON.stringify(data), err => {
        if (err) {
            throw err;
        }
        if (callback) {
            callback();
        }
    });
}

export function open(file: string, callback?: () => void) {
    readFile(file, (err, content) => {
        if (!err) {
            const data: ISavedGame = JSON.parse(content.toString());
            data.jeux.forEach(({jeuData, guids}) => jeux.push(jeuData ? new Jeu(jeuData, guids) : null));
            const loadedKnownGuids: typeof knownGuids = {};
            for (const guid in data.known_guids) {
                if (data.known_guids.hasOwnProperty(guid)) {
                    loadedKnownGuids[guid] = {
                        jeu: jeux[data.known_guids[guid].jeuId],
                        nom: data.known_guids[guid].nom,
                        connection: null,
                    };
                }
            }
            knownGuids = loadedKnownGuids;
            chatAttendant = data.chat_attendant;
        }
        if (callback) {
            callback();
        }
    });
}

export function createActionHandler(cnx: WebsocketConnection) {
    let jeu: Jeu | null = null;
    let guid: string | null = null;
    return (m: Action) => {
        switch (m.type) {
            case Actions.JOINDRE: {
                const newGuid = m.guid;
                knownGuids[newGuid] = {connection:cnx, nom: m.nomJoueur, jeu: null};
                guid = newGuid;
                envoieTousAttendant();
                break;
            }
            case Actions.REJOINDRE: {
                if (m.guid in knownGuids) {
                    guid = m.guid;
                    knownGuids[guid].connection = cnx;
                    jeu = knownGuids[guid].jeu;
                    if (jeu) {
                        cnx.sendUTF(JSON.stringify(ServerResponses.makeRejoindu()));
                        sendToAll(jeu);
                    } else {
                        envoieTousAttendant();
                    }
                } else {
                    sendPasDeJoueurs(cnx);
                    return;
                }
                break;
            }
            case Actions.CREER_JEU:
                if (jeux.length < 20) {
                    const newJeu = Jeu.creeNouveauJeu();
                    jeux.push(newJeu);
                    envoieTousAttendant();
                } else {
                    console.warn('game max count has been reached the limit of 20.');
                    return;
                }
                break;
            case Actions.SUPPRIMER_JEU:
                // remove jeuId
                const i = jeux.findIndex(x => x ? x.data.uid===m.uid : false);
                const jeuToDelete = i >=0 ? jeux[i] : null;
                if ((!jeuToDelete) || jeuToDelete.data.etat !== Etats.ATTENDANT) {
                    console.warn('game does not exist or has already started');
                    return;
                }
                // console.log("jeudtodelete");
                // console.log(jeuToDelete);
                if (jeuToDelete.guids.length > 0) {
                    console.warn('cannot delete game with players inside');
                    // TODO error
                    return;
                }
                jeux.splice(i, 1);
                envoieTousAttendant();
                break;
            case Actions.QUITTER: {
                quitter(guid, cnx);
                break;
            }
            case Actions.JOINDRE_JEU: {
                if (!guid || !(guid in knownGuids)) {
                    return;
                }
                const indexNextJeu = jeux.findIndex(x => x ? x.data.uid===m.uid : false);
                const prochainJeu = jeux[indexNextJeu];
                if ((!prochainJeu) || prochainJeu.data.etat !== Etats.ATTENDANT) {
                    console.warn('game does not exist or has already started');
                    return;
                }
                if (prochainJeu.guids.length >= 4) {
                    console.warn('too many players');
                    // TODO error
                    return;
                }
                const myGuid: string = guid;
                if (prochainJeu.guids.filter(g => knownGuids[g]).find(g => knownGuids[g].nom === knownGuids[myGuid].nom) !== undefined) {
                    console.warn('player name already exists');
                    // TODO error
                    return;
                }
                jeu = prochainJeu;
                jeu.guids.push(guid);
                jeu.data.chat = getChatMessage(null, knownGuids[guid].nom + ' a joint!') + jeu.data.chat;
                knownGuids[guid].jeu = jeu;
                envoieTousAttendant();
                sendToAll(jeu);
                break;
            }
            case Actions.START:
                if (!jeu) {
                    console.warn('Action non permis, jeu pas commencé');
                    return;
                }
                if (jeu.guids.length < 3) {
                    console.warn('not enough player');
                    // TODO error
                    return;
                }
                jeu.commenceJeu();
                envoieTousAttendant();
                sendToAll(jeu);
                break;
            case Actions.ACTION: {
                if (!jeu) {
                    console.warn('Action non permis, jeu pas commencé');
                    return;
                }
                jeu.action(m.data, numeroJoueur(), () => {
                    if (!jeu) {
                        return;
                    }
                    sendToAll(jeu);
                });
                break;
            }
            case Actions.QUITTER_JEU: {
                const myGuid = guid;
                if (jeu && myGuid) {
                    if (jeu.data.etat === Etats.ATTENDANT) {
                        const index = jeu.guids.findIndex(g => g === myGuid);
                        if (index === -1) return;
                        jeu.guids.splice(index, 1);
                        jeu.data.chat = getChatMessage(null, knownGuids[myGuid].nom + ' a quitté!') + jeu.data.chat;
                        sendToAll(jeu);
                    } else {
                        const jeuId = jeux.findIndex(j => j === knownGuids[myGuid].jeu);
                        jeux.splice(jeuId, 1);
                        jeu.guids.forEach(g => knownGuids[g].jeu = null);
                    }
                    knownGuids[myGuid].jeu = null;
                    jeu = null;
                    envoieTousAttendant();
                }
                break;
            }
            case Actions.PROCHAIN_JEU:
                if (jeu) {
                    jeu.prochainJeu();
                    sendToAll(jeu);
                }
                break;
            case Actions.SEND_MESSAGE:
                if (!guid || !(guid in knownGuids)) {
                    return;
                }
                if (jeu !== null) {
                    jeu.data.chat = getChatMessage(knownGuids[guid].nom, m.message) + jeu.data.chat;
                    sendToAll(jeu);
                } else {
                    chatAttendant = getChatMessage(knownGuids[guid].nom, m.message) + chatAttendant;
                    envoieTousAttendant();
                }
                break;
            case Actions.CLIENT_DISCONNECTED:
                setTimeout(() => {
                    cleanClosedConnection(cnx);
                }, 10*1000);
                break;
        }
    };

    function getChatMessage(name: string|null, message: string) {
        return new Date().toTimeString().substring(0, 8) + ' '+ (name ? name + ': ': '') +
            message.substring(0, 100).replace(/\n/g, ' ') + '\n';
    }

    function numeroJoueur() {
        if (!jeu || !jeu.data) return -1;
        return jeu.guids.findIndex(g => g===guid)
    }
}

function quitter(guid : string|null, cnx: connection) {
    if (guid && guid in knownGuids) {
        delete knownGuids[guid];
        envoieTousAttendant();
        sendPasDeJoueurs(cnx);
    }

}

function cleanClosedConnection(cnx : connection) {
    console.log(`start cleaning`);
    for (const guid in knownGuids) {
        if (knownGuids.hasOwnProperty(guid)) {
            const user = knownGuids[guid];
            if (user.connection && !user.connection.connected) {
                console.warn(`cleaning for ${guid}`);
                quitter(guid, cnx);
            }
        }
    }
    console.log('end cleaning');
}

function sendPasDeJoueurs(con: WebsocketConnection) {
    con.sendUTF(JSON.stringify(ServerResponses.makeJoueurJoint(null, [], '')));
}

function envoieTousAttendant() {
    const nomJoueurs = Object.values(knownGuids).filter(g => !g.jeu).map(g=>g.nom);
    const jeu = jeux
        .map((j,i) => {return {jeu: j, i}})
        .filter(j => j.jeu)
        .map(j => {
            const res:IJeu = {
                uid:j.jeu?.data.uid ? j.jeu?.data.uid : '',
                jeuId: j.i,
                active: j.jeu?.data.etat!==Etats.ATTENDANT, 
                joueurs: (j.jeu ? j.jeu.guids.filter(g => knownGuids[g]).map(g=>knownGuids[g].nom) : [])
            };
            return res;
            // return {uid:j.jeu?.data.uid, jeuId: j.i, active: j.jeu?.data.etat!==Etats.ATTENDANT, joueurs: (j.jeu ? j.jeu.guids.map(g=>knownGuids[g].nom) : [])}; 
        });
    Object.values(knownGuids).filter(g => !g.jeu).forEach(g => g.connection?.sendUTF(JSON.stringify(ServerResponses.makeJoueurJoint(nomJoueurs, jeu, chatAttendant))));
}

export function sendToAll(jeu: Jeu) {
    jeu.guids.forEach(guid => {
        const moi = jeu.guids.findIndex(g => g === guid);
        const data = {...jeu.anonymize(moi), nomJoueurs: jeu.guids.filter(g =>knownGuids[g]).map(g=> knownGuids[g].nom)};
        if (knownGuids[guid]) {
            knownGuids[guid].connection?.sendUTF(JSON.stringify(ServerResponses.makeJeu(data, moi)));
        }
    });
}
