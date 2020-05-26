const fetch = require("node-fetch");
const basicCards = require('./data/basicCards'); //phantom cards available for the players but not visible in the api endpoint

getPlayerCards = (username) => (fetch(`https://game-api.splinterlands.io/cards/collection/${username}`,
  { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(x => x.json())
  .then(x => x['cards'] ? x['cards'].map(card => card.card_detail_id) : '')
  .then(advanced => basicCards.concat(advanced))
  .catch(e => console.log(e))
)

module.exports.getPlayerCards = getPlayerCards;
