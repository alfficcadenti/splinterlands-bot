const cardsDetails = require("./data/cardsDetails.json"); //saved json from api endpoint https://game-api.splinterlands.com/cards/get_details?

const makeCardId = (id) => id;

const color = (id) => {
    const card = cardsDetails.find(o => o.id === id);
    const color = card && card.color ? card.color : '';
    return color;
}

exports.makeCardId = makeCardId;
exports.color = color;