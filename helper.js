
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

const mostWinningSummonerTank = (possibleTeamsList) => {
    mostWinningDeck = { fire: 0, death: 0, earth: 0, water: 0, life: 0 }
    const mostWinningSummoner = {};
    const mostWinningTank = {};
    possibleTeamsList.forEach(x => {
        const summoner = x[0];
        mostWinningSummoner[summoner] = mostWinningSummoner[summoner] ? mostWinningSummoner[summoner] + 1 : 1;
    })
    const bestSummoner = Object.keys(mostWinningSummoner).reduce((a, b) => mostWinningSummoner[a] > mostWinningSummoner[b] ? a : b);
    possibleTeamsList.filter(team => team[0] == bestSummoner).forEach(team => {
        const tank = team[1];
        console.log(mostWinningTank)
        mostWinningTank[tank] = mostWinningTank[tank] ? mostWinningTank[tank] + 1 : 1;
    })
    //const bestTank = mostWinningTank && Object.keys(mostWinningTank).reduce((a, b) => mostWinningTank[a] > mostWinningTank[b] ? a : b);
    // return { bestSummoner: bestSummoner, summonerWins: mostWinningSummoner[bestSummoner], tankWins: mostWinningTank[bestTank], bestTank: bestTank }
    return { bestSummoner: bestSummoner, summonerWins: mostWinningSummoner[bestSummoner] }
}

module.exports.teamSplinterToPlay = teamSplinterToPlay;
module.exports.mostWinningSummonerTank = mostWinningSummonerTank;