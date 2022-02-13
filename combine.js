const fs = require('fs');

const history1 = require("./data/history.json");
const history2 = require("./data/newHistory.json");

const newHistory = history1.concat(history2)

fs.writeFile(`./data/newHistory.json`, JSON.stringify(newHistory), function (err) {
    if (err) {
        console.log(err);
    }
});
