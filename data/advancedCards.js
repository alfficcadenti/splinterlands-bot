//module.exports = [157,158,159,160,161,162,163,167,168,169,170,171,172,173,174,178,179,180,181,182,183,184,185,189,146,147,148,149,150,151,152,156,135,136,137,138,139,140,141,145,224,190,191,192,193,194,195,196,'']
const fetch = require("node-fetch");

getAdvancedCards = (username) => (fetch(`https://game-api.splinterlands.io/cards/collection/${username}?v=1583787547346&token=W5T4K3GWY8&username=${username}`,
  { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(x => x.json())
  .then(x => x['cards'] ? x['cards'].map(card => card.card_detail_id) : '')
  .catch(e => console.log(e))
)

// async function asyncCall() {
//   const result = await getAdvancedCards('splinterlava');
//   console.log(result);
//   // expected output: 'resolved'
// }

// asyncCall();
module.exports.getAdvancedCards = getAdvancedCards;
