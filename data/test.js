const history = require("./newHistory.json");

console.log(history.length)

console.log(history[0])

console.log(history.filter(x => x.summoner_id === 156).length)