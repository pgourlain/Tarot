"use strict";

import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as path from 'path';
import * as crypto from 'crypto';
import * as fs from 'fs';

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as send from 'send';
import * as connect from 'connect';
import * as compression from 'compression';
import * as systemdSocket from 'systemd-socket';
import {server as WebSocketServer} from 'websocket'

import {createActionHandler, open, save} from './Orga'
import {MessageAction} from "../datastructure";

const jsFile = {content: "", hash: "", path: ""};
let cssData = "";

const WEB_SERVER = "/tarot";
const BUILD_DIR = process.env.NODE_ENV !== "production" ? "build-debug" : "build";
const PORT = 8181;
const IMG_DIR = __dirname + "/../../img/";

function loadJSFile(js: { content: string, hash: string, path: string }, file: string) {
    fs.readFile(BUILD_DIR + "/" + file + ".js", 'utf8', (err, data) => {
        if (err) {
            console.error("Javascript file for browsernot found!");
            return;
        }

        js.content = data;
        const shasum = crypto.createHash('sha1');
        shasum.update(js.content);
        js.hash = shasum.digest('hex');
        js.path = WEB_SERVER + "/static/" + file + "-" + js.hash.substring(0, 16) + ".js";
    });
}

function loadCSSFile(file: string) {
    fs.readFile(BUILD_DIR + "/" + file + ".css", 'utf8', (err, data) => {
        if (err) {
            console.log("ERROR: main.css not found");
            return;
        }
        cssData = data;
    });
}

function loadJSCSSFile() {
    loadJSFile(jsFile, "main");
    loadCSSFile("../style/main");
    console.log("Loaded js and css file");
}

loadJSCSSFile();

function serveJS(js: { content: string, hash: string, path: string }, req: IncomingMessage, res: ServerResponse) {
    if (req.url == js.path) {
        if ("if-none-match" in req.headers) {
            res.writeHead(304);
            res.end();
        } else {
            res.writeHead(200, {
                'Content-Type': "text/javascript",
                'Cache-Control': "max-age=31536000",
                "ETag": "yes:)"
            });
            res.end(js.content);
        }
        return true;
    }
    return false
}

function reactHandler(req: IncomingMessage, res: ServerResponse) {
    if (process.env.NODE_ENV !== "production") {
        loadJSCSSFile();
    }
    if (serveJS(jsFile, req, res)) {
        return;
    }

    if (req.url && req.url.startsWith(WEB_SERVER)) {
        res.setHeader('Content-Type', 'text/html');
        res.setHeader("Cache-Control", 'no-transform,private,no-cache');

        //<meta name="theme-color" content="#4caf50"/>
        const html = "<!DOCTYPE html>" +
            ReactDOMServer.renderToStaticMarkup(<html lang="fr">
            <head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width"/>
                <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
                <link rel="icon" href={WEB_SERVER + "/img/icon.svg"}/>
                <link rel="icon" sizes="192x192" href={WEB_SERVER + "/img/icon.png"}/>
                <meta name="apple-mobile-web-app-capable" content="yes"/>
                <link rel="apple-touch-icon" href={WEB_SERVER + "/img/icon.png"}/>
                <style dangerouslySetInnerHTML={{__html: cssData}}/>
            </head>
            <body>
            <div id='content'/>
            <script src={jsFile.path}
                    async/>
            </body>
            </html>);

        res.end(html);
    } else {
        res.statusCode = 404;
        res.end('Not found')
    }
}

function servestatic(req: IncomingMessage, res: ServerResponse, next: Function) {
    function error(err: any) {
        console.log(err);
        next();
    }

    if (!req.url) {
        error('Empty url')
        return
    }
    if (req.url == "/" || req.url == "/tarot/") {
        next();
        return;
    }
    send(req, path.basename(decodeURI(req.url)), {root: IMG_DIR, maxAge: 86400000})
        .on('error', error)
        .pipe(res);
}

const app = connect();
app.use((req: IncomingMessage, res: ServerResponse, next: Function) => {
    res.setHeader('Vary', 'Accept-Language');
    next();
});
app.use(compression() as (req: IncomingMessage, res: ServerResponse, next: Function) => void);
app.use(servestatic);
app.use(reactHandler);

const fdOrPort = systemdSocket() || PORT;
const webserver = http.createServer(app);
webserver.listen(fdOrPort, (err: any) => {
    if (err) throw err;
    console.log('Listening on ' + fdOrPort + '...')
});

const wsServer = new WebSocketServer({
    httpServer: webserver,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin: string) {
    // TODO put logic here to detect whether the specified origin is allowed.
    return true;
}

const saveFile = "tarotjeux.json";
open(saveFile);

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('tarot-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    const actionHandler = createActionHandler(connection);

    connection.on('message', function (message) {
        if (message.type === 'utf8' && message.utf8Data) {
            console.log('Received Message: ' + message.utf8Data);
            const m: MessageAction = JSON.parse(message.utf8Data);
            console.log(m);
            actionHandler(m);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function saveAndExit() {
    save(saveFile, () => process.exit());
}

process.on('SIGINT', saveAndExit);
process.on('SIGTERM', saveAndExit);
