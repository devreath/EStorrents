import jsdom from "jsdom";
import donTorrent from "./dontorrent.js";

var imdb = {
    RetrieveTitleFromImdb: async function(imdbId) {
        //create request to imdb
        let headersList = {
            "Accept": '"*/*"',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
            'cookie': 'lc-main=es_ES'
        }
    
        let response = await fetch(`https://www.imdb.com/title/${imdbId}/`, {
            method: "GET",
            headers: headersList
        });
    
        let htmRawResponse = await response.text();
        //create DOM parser
        const htmlDocument = new jsdom.JSDOM(htmRawResponse);
        //retrieve title
        const title = htmlDocument.window.document.getElementsByClassName('sc-afe43def-1 fDTGTb')[0].textContent;
        //search torrents
        console.log(title);
        return await donTorrent.SearchInDontorrent(title);
    
    }
}

export default imdb;