
const cardsDetails = require("./data/cardsDetails.json");

// const teamIdsArray = [167, 192, 160, 161, 163, 196, '', 'fire'];

cardColor = (id) => cardsDetails.find(o => o.id === id) ? cardsDetails.find(o => o.id === id).color : '';

const validDecks = ['Red', 'Blue', 'White', 'Black', 'Green']
const colorToDeck = { 'Red': 'Fire', 'Blue': 'Water', 'White': 'Life', 'Black': 'Death', 'Green': 'Earth' }

// const tes = teamIdsArray.forEach(id => {
//     console.log('DEBUG', id, cardColor(id))
//     if (validDecks.includes(cardColor(id))) {
//         return colorToDeck[cardColor(id)];
//     }
// })

const deckValidColor = (accumulator, currentValue) => validDecks.includes(cardColor(currentValue)) ? colorToDeck[cardColor(currentValue)] : accumulator;

//console.log(teamIdsArray.reduce(deckValidColor, ''));

const teamSplinterToPlay = (teamIdsArray) => teamIdsArray.reduce(deckValidColor, '')

module.exports.teamSplinterToPlay = teamSplinterToPlay;