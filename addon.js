import pkg from 'stremio-addon-sdk';
const { addonBuilder, serveHTTP, publishToCentral } = pkg;
import jsdom from "jsdom";
import parseTorrent from 'parse-torrent';
import { Base64Encode } from 'base64-stream';
import request from 'request';
import axios from 'axios';
import imdb from './imdb.js';
import donTorrent from './dontorrent.js';


const builder = new addonBuilder({
    id: 'org.EStorrent',
    version: '1.0.0',
    name: 'EStorrent',
    // Properties that determine when Stremio picks this addon
    // this means your addon will be used for streams of the type movie
    catalogs: [],
    resources: ['stream'],
    types: ['movie'],
    idPrefixes: ['tt']
})

// takes function(args)
builder.defineStreamHandler(async function (args) {

    console.log('stream detected');
    console.log(args);
    let streams = [];
    let operations = []
    //push operations
    await operations.push(new Promise(async(resolve, reject) => {
        resolve(await donTorrent.GlobalSearchDonTorrent(args.id))
    }));

    await Promise.all(await operations.map(async(x) => x.then(res => {
        res.map((stream)=> {
            streams.push(stream);
        })
    })));



    console.log("Antes de resolve Stream");
    return Promise.resolve({ streams: streams })

})

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })
//publishToCentral("https://your-domain/manifest.json") // <- invoke this if you want to publish your addon and it's accessible publically on "your-domain"







