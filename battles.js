
const mostWinningSummonerTank = (possibleTeamsList) => {
    mostWinningDeck = { fire: 0, death: 0, earth: 0, water: 0, life: 0 }
    const mostWinningSummoner = {};
    const mostWinningTank = {};
    const mostWinningBackline = {};
    possibleTeamsList.forEach(x => {
        const summoner = x[0];
        mostWinningSummoner[summoner] = mostWinningSummoner[summoner] ? mostWinningSummoner[summoner] + 1 : 1;
    })
    const bestSummoner = Object.keys(mostWinningSummoner).length && Object.keys(mostWinningSummoner).reduce((a, b) => mostWinningSummoner[a] > mostWinningSummoner[b] ? a : b);
    console.log('BESTSUMMONER: ', bestSummoner)
    if (bestSummoner) {
        possibleTeamsList.filter(team => team[0] == bestSummoner).forEach(team => {
            const tank = team[1];
            mostWinningTank[tank] = mostWinningTank[tank] ? mostWinningTank[tank] + 1 : 1;
        })
        const bestTank = mostWinningTank && Object.keys(mostWinningTank).length && Object.keys(mostWinningTank).reduce((a, b) => mostWinningTank[a] > mostWinningTank[b] ? a : b);

        if (bestTank) {
            possibleTeamsList.filter(team => team[0] == bestSummoner && team[1] == bestTank).forEach(team => {
                const backline = team[2];
                mostWinningBackline[backline] = mostWinningBackline[backline] ? mostWinningBackline[backline] + 1 : 1;
            })
            const bestBackline = mostWinningBackline && Object.keys(mostWinningBackline).length && Object.keys(mostWinningBackline).reduce((a, b) => mostWinningBackline[a] > mostWinningBackline[b] ? a : b);
            return { bestSummoner: bestSummoner, summonerWins: mostWinningSummoner[bestSummoner], tankWins: mostWinningTank[bestTank], bestTank: bestTank, bestBackline: bestBackline, backlineWins: mostWinningBackline[bestBackline] }
        }

        return { bestSummoner: bestSummoner, summonerWins: mostWinningSummoner[bestSummoner], tankWins: mostWinningTank[bestTank], bestTank: bestTank }
    }
    //return { bestSummoner: bestSummoner, summonerWins: mostWinningSummoner[bestSummoner], tankWins: mostWinningTank[bestTank], bestTank: bestTank }
    return { bestSummoner: bestSummoner, summonerWins: mostWinningSummoner[bestSummoner] }
}

module.exports.mostWinningSummonerTank = mostWinningSummonerTank;