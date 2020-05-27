
const mostWinningSummonerTank = (possibleTeamsList) => {
    mostWinningDeck = { fire: 0, death: 0, earth: 0, water: 0, life: 0 }
    const mostWinningSummoner = {};
    const mostWinningTank = {};
    possibleTeamsList.forEach(x => {
        const summoner = x[0];
        mostWinningSummoner[summoner] = mostWinningSummoner[summoner] ? mostWinningSummoner[summoner] + 1 : 1;
    })
    const bestSummoner = Object.keys(mostWinningSummoner).length && Object.keys(mostWinningSummoner).reduce((a, b) => mostWinningSummoner[a] > mostWinningSummoner[b] ? a : b);
    if (bestSummoner) {
        console.log('bestSummoner',bestSummoner)
        possibleTeamsList.filter(team => team[0] == bestSummoner).forEach(team => {
            const tank = team[1];
            console.log('DEBUG', mostWinningTank, tank)
            mostWinningTank[tank] = mostWinningTank[tank] ? mostWinningTank[tank] + 1 : 1;
        })
        //const bestTank = mostWinningTank && Object.keys(mostWinningTank).reduce((a, b) => mostWinningTank[a] > mostWinningTank[b] ? a : b);
        // return { bestSummoner: bestSummoner, summonerWins: mostWinningSummoner[bestSummoner], tankWins: mostWinningTank[bestTank], bestTank: bestTank }
    }
    return { bestSummoner: bestSummoner, summonerWins: mostWinningSummoner[bestSummoner], tankWins: mostWinningTank[bestTank], bestTank: bestTank }
    }

module.exports.mostWinningSummonerTank = mostWinningSummonerTank;