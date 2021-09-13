require('dotenv').config()
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
{ 110: 'fire' },
{ 49: 'death' },
{ 88: 'dragon' },
{ 38: 'life' },
{ 239: 'life' },
{ 74: 'death' },
{ 78: 'dragon' },
{ 260: 'fire' },
{ 70: 'fire' },
{ 109: 'death' },
{ 111: 'water' },
{ 112: 'earth' },
{ 130: 'dragon' },
{ 72: 'earth' },
{ 235: 'dragon' },
{ 56: 'dragon' },
{ 113: 'life' },
{ 200: 'dragon' },
{ 236: 'fire' },
{ 240: 'dragon' },
{ 254: 'water' },
{ 257: 'water' },
{ 258: 'death' },
{ 259: 'earth' },
{ 261: 'life' },
{ 262: 'dragon' },
{ 278: 'earth' },
{ 73: 'life' }]

const splinters = ['fire', 'life', 'earth', 'water', 'death', 'dragon']

const getSummoners = (myCards) => {
    try {
        const sumArray = summoners.map(x=>Number(Object.keys(x)[0]))
        const mySummoners = myCards.filter(value => sumArray.includes(Number(value)));
        return mySummoners;             
    } catch(e) {
        console.log(e);
        return [];
    }
}

const summonerColor = (id) => {
    const summonerDetails = summoners.find(x => x[id]);
    return summonerDetails ? summonerDetails[id] : '';
}

const historyBackup = require("./data/newHistory.json");
const basicCards = require('./data/basicCards.js');

let availabilityCheck = (base, toCheck) => toCheck.slice(0, 7).every(v => base.includes(v));

const getBattlesWithRuleset = (ruleset, mana, summoners) => {
    const rulesetEncoded = encodeURIComponent(ruleset);
    console.log(process.env.API)
    const host = process.env.API || 'https://splinterlands-data-service.herokuapp.com/'
//    const host = 'http://localhost:3000/'
    let url = ''
    if (process.env.API_VERSION == 2) {
        url = `V2/battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${process.env.ACCOUNT}&token=${process.env.TOKEN}&summoners=${summoners ? JSON.stringify(summoners) : ''}`;
    } else {
        url = `battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${process.env.ACCOUNT}&token=${process.env.TOKEN}&summoners=${summoners ? JSON.stringify(summoners) : ''}`;
    }
    console.log('API call: ', host+url)
    return fetch(host+url)
        .then(x => x && x.json())
        .then(data => data)
        .catch((e) => console.log('fetch ', e))
}

const battlesFilterByManacap = async (mana, ruleset, summoners) => {
    const history = await getBattlesWithRuleset(ruleset, mana, summoners);
    if (history) {
        console.log('API battles returned ', history.length)
        return history.filter(
            battle =>
                battle.mana_cap == mana &&
                (ruleset ? battle.ruleset === ruleset : true)
        )
    }
    const backupLength = historyBackup && historyBackup.length
    console.log('API battles did not return ', history)
    console.log('Using Backup ', backupLength)
    
    return historyBackup.filter(
        battle =>
            battle.mana_cap == mana &&
            (ruleset ? battle.ruleset === ruleset : true)
    )
}

function compare(a, b) {
    const totA = a[9];
    const totB = b[9];
  
    let comparison = 0;
    if (totA < totB) {
      comparison = 1;
    } else if (totA > totB) {
      comparison = -1;
    }
    return comparison;
  }

const cardsIdsforSelectedBattles = (mana, ruleset, splinters, summoners) => battlesFilterByManacap(mana, ruleset, summoners)
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
                    summonerColor(x.summoner_id) ? summonerColor(x.summoner_id) : '',
                    x.tot ? parseInt(x.tot) : '',
                    x.ratio ? parseInt(x.ratio) : '',
                ]
            }
        ).filter(
            team => splinters.includes(team[7])
        ).sort(compare)
    })

const askFormation = function (matchDetails) {
    const cards = matchDetails.myCards || basicCards;
    const mySummoners = getSummoners(cards);
    console.log('INPUT: ', matchDetails.mana, matchDetails.rules, matchDetails.splinters, cards.length)
    return cardsIdsforSelectedBattles(matchDetails.mana, matchDetails.rules, matchDetails.splinters, mySummoners)
        .then(x => x.filter(
            x => availabilityCheck(cards, x))
            .map(element => element)//cards.cardByIds(element)
        )

}

const possibleTeams = async (matchDetails) => {
    let possibleTeams = [];
    while (matchDetails.mana > 10) {
        console.log('check battles based on mana: '+matchDetails.mana)
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
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins > 1 && bestCombination.thirdBacklineWins > 1 && bestCombination.forthBacklineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline && x[3] == bestCombination.bestSecondBackline && x[4] == bestCombination.bestThirdBackline && x[5] == bestCombination.bestForthBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins > 1 && bestCombination.thirdBacklineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline && x[3] == bestCombination.bestSecondBackline && x[4] == bestCombination.bestThirdBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline && x[3] == bestCombination.bestSecondBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
}

const teamSelection = async (possibleTeams, matchDetails, quest) => {

    //TEST V2 Strategy ONLY FOR PRIVATE API
    if (process.env.API_VERSION == 2 && possibleTeams[0][8]) {
        console.log('play the most winning: ', possibleTeams[0])
        return { summoner: possibleTeams[0][0], cards: possibleTeams[0] };
    }
    

    //check if daily quest is not completed
    console.log('quest custom option set as:', process.env.QUEST_PRIORITY)
    let priorityToTheQuest = process.env.QUEST_PRIORITY === 'false' ? false : true;
    if(priorityToTheQuest && possibleTeams.length > 25 && quest && quest.total) {
        const left = quest.total - quest.completed;
        const questCheck = matchDetails.splinters.includes(quest.splinter) && left > 0;
        const filteredTeams = possibleTeams.filter(team=>team[7]===quest.splinter)
        console.log(left + ' battles left for the '+quest.splinter+' quest')
        console.log('play for the quest ',quest.splinter,'? ',questCheck)
        if(left > 0 && filteredTeams && filteredTeams.length > 3 && splinters.includes(quest.splinter)) {
            console.log('PLAY for the quest with Teams: ',filteredTeams.length , filteredTeams)
            const res = await mostWinningSummonerTankCombo(filteredTeams, matchDetails);
            console.log('Play this for the quest:', res)
            if (res[0] && res[1]) {
                return { summoner: res[0], cards: res[1] };
            }
        }
    }

    //find best combination (most used)
    const res = await mostWinningSummonerTankCombo(possibleTeams, matchDetails);
    console.log('Dont play for the quest, and play this:', res)
    if (res[0] && res[1]) {
        return { summoner: res[0], cards: res[1] };
    }

    let i = 0;
    for (i = 0; i <= possibleTeams.length - 1; i++) {
        if (matchDetails.splinters.includes(possibleTeams[i][7]) && helper.teamActualSplinterToPlay(possibleTeams[i]) !== '' && matchDetails.splinters.includes(helper.teamActualSplinterToPlay(possibleTeams[i]).toLowerCase())) {
            console.log('Less than 25 teams available. SELECTED: ', possibleTeams[i]);
            const summoner = card.makeCardId(possibleTeams[i][0].toString());
            return { summoner: summoner, cards: possibleTeams[i] };
        }
        console.log('DISCARDED: ', possibleTeams[i])
    }
    throw new Error('NO TEAM available to be played.');
}


module.exports.possibleTeams = possibleTeams;
module.exports.teamSelection = teamSelection;