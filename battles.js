
const mostWinningSummonerTank = (possibleTeamsList) => {
    mostWinningDeck = { fire: 0, death: 0, earth: 0, water: 0, life: 0 }
    const mostWinningSummoner = {};
    const mostWinningTank = {};
    const mostWinningBackline = {};
    const mostWinningSecondBackline = {};
    const mostWinningThirdBackline = {};
    const mostWinningForthBackline = {};
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

            if (bestBackline) {
                possibleTeamsList.filter(team => team[0] == bestSummoner && team[1] == bestTank && team[2] == bestBackline).forEach(team => {
                    const secondBackline = team[3];
                    mostWinningSecondBackline[secondBackline] = mostWinningSecondBackline[secondBackline] ? mostWinningSecondBackline[secondBackline] + 1 : 1;
                })
                const bestSecondBackline = mostWinningSecondBackline && Object.keys(mostWinningSecondBackline).length && Object.keys(mostWinningSecondBackline).reduce((a, b) => mostWinningSecondBackline[a] > mostWinningSecondBackline[b] ? a : b);
                
                if (bestSecondBackline) {
                    possibleTeamsList.filter(team => team[0] == bestSummoner && team[1] == bestTank && team[2] == bestBackline && team[3] == bestSecondBackline).forEach(team => {
                        const thirdBackline = team[4];
                        mostWinningThirdBackline[thirdBackline] = mostWinningThirdBackline[thirdBackline] ? mostWinningThirdBackline[thirdBackline] + 1 : 1;
                    })
                    const bestThirdBackline = mostWinningThirdBackline && Object.keys(mostWinningThirdBackline).length && Object.keys(mostWinningThirdBackline).reduce((a, b) => mostWinningThirdBackline[a] > mostWinningThirdBackline[b] ? a : b);
                    
                    if (bestThirdBackline) {
                        possibleTeamsList.filter(team => team[0] == bestSummoner && team[1] == bestTank && team[2] == bestBackline && team[3] == bestSecondBackline && team[4] == bestThirdBackline).forEach(team => {
                            const forthBackline = team[5];
                            mostWinningForthBackline[forthBackline] = mostWinningForthBackline[forthBackline] ? mostWinningForthBackline[forthBackline] + 1 : 1;
                        })
                        const bestForthBackline = mostWinningForthBackline && Object.keys(mostWinningForthBackline).length && Object.keys(mostWinningForthBackline).reduce((a, b) => mostWinningForthBackline[a] > mostWinningForthBackline[b] ? a : b);
                        
                        return { 
                            bestSummoner: bestSummoner, 
                            summonerWins: mostWinningSummoner[bestSummoner], 
                            tankWins: mostWinningTank[bestTank], 
                            bestTank: bestTank, 
                            bestBackline: bestBackline, 
                            backlineWins: mostWinningBackline[bestBackline], 
                            bestSecondBackline: bestSecondBackline, 
                            secondBacklineWins: mostWinningSecondBackline[bestSecondBackline],
                            bestThirdBackline: bestThirdBackline, 
                            thirdBacklineWins: mostWinningThirdBackline[bestThirdBackline],
                            bestForthBackline: bestForthBackline, 
                            forthBacklineWins: mostWinningForthBackline[bestForthBackline] 
                        }
                    }

                    return { 
                        bestSummoner: bestSummoner, 
                        summonerWins: mostWinningSummoner[bestSummoner], 
                        tankWins: mostWinningTank[bestTank], 
                        bestTank: bestTank, 
                        bestBackline: bestBackline, 
                        backlineWins: mostWinningBackline[bestBackline], 
                        bestSecondBackline: bestSecondBackline, 
                        secondBacklineWins: mostWinningSecondBackline[bestSecondBackline],
                        bestThirdBackline: bestThirdBackline, 
                        thirdBacklineWins: mostWinningThirdBackline[bestThirdBackline] 
                    }
                }

                return { 
                    bestSummoner: bestSummoner, 
                    summonerWins: mostWinningSummoner[bestSummoner], 
                    tankWins: mostWinningTank[bestTank], 
                    bestTank: bestTank, 
                    bestBackline: bestBackline, 
                    backlineWins: mostWinningBackline[bestBackline], 
                    bestSecondBackline: bestSecondBackline, 
                    secondBacklineWins: mostWinningSecondBackline[bestSecondBackline] 
                }
            }

            return { 
                bestSummoner: bestSummoner, 
                summonerWins: mostWinningSummoner[bestSummoner], 
                tankWins: mostWinningTank[bestTank], 
                bestTank: bestTank, 
                bestBackline: bestBackline, 
                backlineWins: mostWinningBackline[bestBackline] 
            }
        }

        return { 
            bestSummoner: bestSummoner, 
            summonerWins: mostWinningSummoner[bestSummoner], 
            tankWins: mostWinningTank[bestTank], 
            bestTank: bestTank 
        }
    }
    return { 
        bestSummoner: bestSummoner, 
        summonerWins: mostWinningSummoner[bestSummoner] 
    }
}

module.exports.mostWinningSummonerTank = mostWinningSummonerTank;