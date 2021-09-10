const cardsDetails = require("./data/cardsDetails.json"); //saved json from api endpoint https://game-api.splinterlands.com/cards/get_details?

const makeCardId = (id) => id;

const color = (id) => {
    const card = cardsDetails.find(o => parseInt(o.id) === parseInt(id));
    return card?.color || '';
}

const name = (id) => {
    const card = cardsDetails.find(o => parseInt(o.id) === parseInt(id));
    return card?.name || '';
}

exports.makeCardId = makeCardId;
exports.color = color;
exports.name = name;