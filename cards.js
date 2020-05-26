const makeCardId = (id) => '#card_' + id;

const color = (id) => {
    const card = cardsDetails.find(o => o.id === id);
    return card.color;
}

exports.makeCardId = makeCardId;
exports.color = color;