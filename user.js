const fetch = require("node-fetch");
const basicCards = require('./data/basicCards');//phantom cards available for the players but not visible in the api endpoint
const moment = require("moment"); 

const isPlayable = (username, card) => {
  if ((card.delegated_to === username || card.delegated_to === null || card.delegated_to === '') && //card delegated to player or owned
  (card.market_listing_status === null || card.market_listing_status === '' || (card.market_listing_status != null && card.delegated_to === username)) && // not listed to market 
  (card.unlock_date === null || card.unlock_date === '') && // not locked
  ((card.last_used_player === username || card.last_used_player === null) || (card.last_used_player !== username && moment.duration(moment().diff(card.last_used_date)).days() > 1)) && // rented not locked
  card.edition != 6 // not a gladiator (not playable in ranked battle)
  ) {
    return true
  }
  else {
    return false
  }
}

const isRented = (username, card) => {
  if ((card.delegated_to === username && card.player !== username) && //card is delegated to player
  (card.unlock_date === null || card.unlock_date === '') && 
  ((card.last_used_player === username || card.last_used_player === null) || (card.last_used_player !== username && moment.duration(moment().diff(card.last_used_date)).days() > 1))) // not locked
  {
    return true
  }
  else {
    return false
  }
}

getPlayerCards = (username) => (fetch(`https://api2.splinterlands.com/cards/collection/${username}`,
  { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(x => x && x.json())
  .then(x => x['cards'] ? x['cards'].filter(x=>isPlayable(username,x)).map(card => card.card_detail_id) : '')
  .then(advanced => basicCards.concat(advanced))
  .catch(e=> {
    console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... ');
    fetch(`https://api.splinterlands.io/cards/collection/${username}`,
      { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
      .then(x => x && x.json())
      .then(x => x['cards'] ? x['cards'].filter(x=>isPlayable(username,x)).map(card => card.card_detail_id) : '')
      .then(advanced => basicCards.concat(advanced))
      .catch(e => {
        console.log('Using only basic cards due to error when getting user collection from splinterlands: ',e); 
        return basicCards
      })
  })
)

getRentedCards = (username) => (fetch(`https://api2.splinterlands.com/cards/collection/${username}`,
  { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(x => x && x.json())
  .then(x => x['cards'] ? x['cards'].filter(x=>isRented(username, x)).map(card => card.card_detail_id) : '')
  .catch(e=> {
    console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... ');
    fetch(`https://api.splinterlands.io/cards/collection/${username}`,
      { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
      .then(x => x && x.json())
      .then(x => x['cards'] ? x['cards'].filter(x=>isRented(username, x)).map(card => card.card_detail_id) : '')
      .then(advanced => basicCards.concat(advanced))
      .catch(e => {
        console.log('Using only basic cards due to error when getting user collection from splinterlands: ',e); 
        return basicCards
      })
  })
)

module.exports.getPlayerCards = getPlayerCards;
module.exports.getRentedCards = getRentedCards;