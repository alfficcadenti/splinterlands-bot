const cards = require('./getCards.js');
const card = require('./cards');
const helper = require('./helper');
const battles = require('./battles');
const fetch = require("node-fetch");

const summoners = [{ 224: 'dragon' },
{ 27: 'earth' },
{ 16: 'water' },
{ 156: 'life' },
{ 189: 'earth' },
{ 167: 'fire' },
{ 145: 'death' },
{ 5: 'fire' },
{ 71: 'water' },
{ 114: 'dragon' },
{ 178: 'water' },
{ 110: '' },
{ 49: 'death' },
{ 88: 'dragon' },
{ 38: 'white' },
{ 236: '' },
{ 74: 'death' },
{ 200: '' },
{ 70: '' },
{ 109: '' },
{ 111: '' },
{ 130: '' },
{ 72: '' },
{ 112: '' },
{ 235: '' },
{ 56: '' },
{ 113: '' },
{ 73: 'life' }]

const summonerColor = (id) => {
    const summonerDetails = summoners.find(x => x[id]);
    return summonerDetails ? summonerDetails[id] : '';
}

const historyBackup = require("./data/newHistory.json");
//const myCards = require('./data/myCards.js');
const myCards = require('./data/splinterlavaCards.js');


let availabilityCheck = (base, toCheck) => toCheck.slice(0, 7).every(v => base.includes(v));

const getBattlesWithRuleset = (ruleset, mana) => {
    const rulesetEncoded = encodeURIComponent(ruleset);
    return fetch(`https://splinterlands-data-service.herokuapp.com/battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${process.env.ACCOUNT}`)
        .then(x => x && x.json())
        .then(data => data)
        .catch((e) => console.log('fetch ', e))
}

const battlesFilterByManacap = async (mana, ruleset) => {
    const history = await getBattlesWithRuleset(ruleset, mana);
    if (history) {
        return history.filter(
            battle =>
                battle.mana_cap == mana &&
                (ruleset ? battle.ruleset === ruleset : true)
        )
    }
    return historyBackup.filter(
        battle =>
            battle.mana_cap == mana &&
            (ruleset ? battle.ruleset === ruleset : true)
    )
}

const cardsIdsforSelectedBattles = (mana, ruleset, splinters) => battlesFilterByManacap(mana, ruleset, splinters)
    .then(x => {
        return x.map(
            (x) => {
                return [
                    x.summoner_id ? parseInt(x.summoner_id) : '',
                    x.monster_1_id ? parseInt(x.monster_1_id) : '',
                    x.monster_2_id ? parseInt(x.monster_2_id) : '',
                    x.monster_3_id ? parseInt(x.monster_3_id) : '',
                    x.monster_4_id ? parseInt(x.monster_4_id) : '',
                    x.monster_5_id ? parseInt(x.monster_5_id) : '',
                    x.monster_6_id ? parseInt(x.monster_6_id) : '',
                    summonerColor(x.summoner_id) ? summonerColor(x.summoner_id) : ''
                ]
            }
        ).filter(
            team => splinters.includes(team[7])
        )
    })



//for (i=13; i<100; i++) {

// const manaCap = 22;
// const inactive = ['White']

const askFormation = function (matchDetails) {
    console.log('INPUT: ', matchDetails.mana, matchDetails.rules, matchDetails.splinters)
    return cardsIdsforSelectedBattles(matchDetails.mana, matchDetails.rules, matchDetails.splinters)
        .then(x => x.filter(
            x => availabilityCheck(matchDetails.myCards, x))
            .map(element => element)//cards.cardByIds(element)
        )

}

const possibleTeams = async (matchDetails) => {
    // const res = await getBattlesWithRuleset(matchDetails.rules);
    // console.log(res);
    let possibleTeams = [];
    while (matchDetails.mana > 0) {
        possibleTeams = await askFormation(matchDetails)
        if (possibleTeams.length > 0) {
            return possibleTeams;
        }
        matchDetails.mana--;
    }
    return possibleTeams;
}

const mostWinningSummonerTankCombo = async (possibleTeams, matchDetails) => {
    const bestCombination = await battles.mostWinningSummonerTank(possibleTeams)
    console.log('BEST SUMMONER and TANK', bestCombination)
    if (bestCombination.summonerWins > 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins > 1 && bestCombination.tankWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
        // if (matchDetails.splinters.includes(helper.teamSplinterToPlay(bestTeam).toLowerCase()) && helper.teamActualSplinterToPlay(helper.teamSplinterToPlay(bestTeam)) !== '') {
        //     if (matchDetails.splinters.includes(helper.teamSplinterToPlay(bestTeam).toLowerCase())) {
        //         console.log('PLAY BEST SUMMONER and TANK: ', helper.teamSplinterToPlay(bestTeam), bestTeam)
        //         const summoner = card.makeCardId(bestTeam[0].toString());
        //         return [summoner, bestTeam];
        //     }
        // }

    }
}

const teamSelection = async (possibleTeams, matchDetails) => {
    //SBLOCCARE QUI PER USARE BEST SUMMONER FUNCTION
    if (possibleTeams.length > 5) {
        //find best combination (most used)
        const res = await mostWinningSummonerTankCombo(possibleTeams, matchDetails);
        console.log('PlayThis', res)
        if (res[0] && res[1]) {
            return { summoner: res[0], cards: res[1] };
        }
    }

    let i = 0;
    for (i = 0; i <= possibleTeams.length - 1; i++) {
        //console.log('TESTTT', helper.teamActualSplinterToPlay(possibleTeams[i]), matchDetails.splinters.includes(helper.teamActualSplinterToPlay(possibleTeams[i]).toLowerCase()));
        if (matchDetails.splinters.includes(possibleTeams[i][7]) && helper.teamActualSplinterToPlay(possibleTeams[i]) !== '' && matchDetails.splinters.includes(helper.teamActualSplinterToPlay(possibleTeams[i]).toLowerCase())) {
            console.log('SELECTED: ', possibleTeams[i]);
            const summoner = card.makeCardId(possibleTeams[i][0].toString());
            return { summoner: summoner, cards: possibleTeams[i] };
        }
        console.log('DISCARDED: ', possibleTeams[i])
    }
    throw new Error('NO TEAM available');
}


module.exports.possibleTeams = possibleTeams;
module.exports.teamSelection = teamSelection;


// const summoners = history.map(x => x.summoner_id);

// // console.log([...new Set(summoners)])
// console.log(summonerColor(27))

// // TO TEST uncomment below:
// const matchDetails = { mana: 30, rules: '', splinters: ['fire','water','life','earth','death'], myCards: myCards}
// console.log(possibleTeams(matchDetails))