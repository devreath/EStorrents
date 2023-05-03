import jsdom from "jsdom";
import axios from 'axios';
import parseTorrent from 'parse-torrent';
import imdb from "./imdb.js";

var donTorrent = {

    GlobalSearchDonTorrent: async function(imdbId) {

        return new Promise((resolve, reject)=> {
            resolve(imdb.RetrieveTitleFromImdb(imdbId));
        })
       
    },

    SearchInDontorrent: async function (movieTitle) {
        //mount uri
        const encodedUri = `https://dontorrent.observer/?sec=buscador&valor=${this.encodeParamsDonTorrent(movieTitle)}&Buscar=Buscar`;
        console.log(encodedUri);

        let headersList = {
            "Accept": "*/*",
            'referer': 'https://dontorrent.observer/?',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
        }

        let response = await fetch(encodedUri, {
            method: "GET",
            headers: headersList
        });

        //retrieve html
        let htmRawResponse = await response.text();
        //create dom parser
        const htmlDocument = new jsdom.JSDOM(htmRawResponse);
        //search for results
        const elements = htmlDocument.window.document.querySelectorAll('span a');
        let streams = [];
        for (const element of elements) {
            try {
                const quality = `🎥 ${element.parentElement.children[1].textContent.replaceAll('(', '').replaceAll(')', '')}` || 'N/A';
                const title = element.textContent || 'it has not been possible to obtain the title';
                const url = `https://dontorrent.observer${element.getAttribute('href')}`;
                console.log(url);
                const stream = { title: title + '\n' + quality, infoHash: url };
                streams.push(stream);
                console.log(element.textContent);
            } catch (exception) {
                console.error("Not posible to deal with posible element");
            }
        };

        //one we have streams, try to load torrent url
        await Promise.all(await streams.map(async (x) => await this.GetDownloadUrl(x.infoHash).then(async res => {
            // console.log(res.data);
            //search for url
            try {
                const htmlDocument = new jsdom.JSDOM(res.data);
                // console.log(res.data);
                const elements = htmlDocument.window.document.getElementsByClassName('text-white bg-primary rounded-pill d-block shadow text-decoration-none p-1');
                const hrefValue = elements[0].getAttribute('href');
                const torrentUrl = `https:${hrefValue}`;
                console.log(torrentUrl);

                //try to get torrent info
                const getBuffer = await this.GetHashInfoFromUrl(torrentUrl).then((res) => {
                    const base64 = Buffer.from(res.data, 'binary').toString('base64')
                    const buffer = Buffer.from(base64, 'base64');
                    return buffer;
                });

                const torrentMeta = await parseTorrent(getBuffer).then((torrentInfo) => {
                    return torrentInfo;
                });
                console.log(torrentMeta.infoHash);
                x.infoHash = torrentMeta.infoHash;
                x.title = x.title.concat(`\n💾 ${this.FormatBytes(torrentMeta.length) || 'N/A'}`)


            } catch (exception) {
                console.error("Cant get torrent url for: " + x.title);
            }

        })));

        console.log("endnd loading");
        return streams;


    },

    /**
     * 
     * @param {string} searchParams 
     * @returns {string}
     */
    encodeParamsDonTorrent: function (searchParams) {
        return searchParams.replaceAll(' ', '+');
    },

    GetDownloadUrl: async function (pageUrl) {
        const config = {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
            }
        };
        return new Promise((resolve, reject) => {
            axios.get(pageUrl, config).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    },

    /**
 * 
 * @param {string} torrentUrl 
 */
    GetHashInfoFromUrl: async function (torrentUrl) {


        return axios
            .get(torrentUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
                }
            })

    },

    FormatBytes: function (bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }


}

export default donTorrent;