/* global __PATH_PREFIX__ */
const lunr = require("lunr");
const { enhanceLunr } = require("./common.js");

exports.onClientEntry = (
    args,
    {
        indexname = "",
        languages,
        filename = "search_index.json",
        fetchOptions = {} }
) => {
    enhanceLunr(lunr, languages);
    const lunrIndexName = indexname ? "__LUNR__" + indexname + "__" : "__LUNR__"
    window[lunrIndexName] = window[lunrIndexName] || {};
    window[lunrIndexName].__loaded = fetch(
        `${__PATH_PREFIX__}/${filename}`,
        fetchOptions
    )
        .then(function(response) {
            return response.json();
        })
        .then(function(fullIndex) {
            window[lunrIndexName] = Object.keys(fullIndex).reduce(
                (prev, key) => ({
                    ...prev,
                    [key]: {
                        index: lunr.Index.load(fullIndex[key].index),
                        store: fullIndex[key].store
                    }
                }),
                {
                    __loaded: window[lunrIndexName].__loaded
                }
            );
            return window[lunrIndexName];
        })
        .catch(e => {
            console.log("Failed fetch search index");
            throw e;
        });
};
