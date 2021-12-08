require('dotenv').config()
const card = require('./cards');
const helper = require('./helper');
const battles = require('./battles');
const fetch = require("node-fetch");

const summoners = [{260: 'fire'},
{257: 'water'},
{437: 'water'},
{224: 'dragon'},
{189: 'earth'},
{145: 'death'},
{240: 'dragon'},
{167: 'fire'},
{438: 'death'},
{156: 'life'},
{440: 'fire'},
{114: 'dragon'},
{441: 'life'},
{439: 'earth'},
{262: 'dragon'},
{261: 'life'},
{178: 'water'},
{258: 'death'},
{27: 'earth'},
{38: 'life'},
{49: 'death'},
{5: 'fire'},
{70: 'fire'},
{38: 'life'},
{73: 'life'},
{259: 'earth'},
{74: 'death'},
{72: 'earth'},
{442: 'dragon'},
{71: 'water'},
{88: 'dragon'},
{78: 'dragon'},
{200: 'dragon'},
{16: 'water'},
{239: 'life'},
{254: 'water'},
{235: 'death'},
{113: 'life'},
{109: 'death'},
{110: 'fire'},
{291: 'dragon'},
{278: 'earth'},
{236: 'fire'},
{56: 'dragon'},
{112: 'earth'},
{111: 'water'},
{56: 'dragon'},
{205: 'dragon'},
{130: 'dragon'}]

const splinters = ['fire', 'life', 'earth', 'water', 'death', 'dragon']

const getSummoners = (myCards, splinters) => {
    try {
        const sumArray = summoners.map(x=>Number(Object.keys(x)[0]))
        const mySummoners = myCards.filter(value => sumArray.includes(Number(value)));
        const myAvailableSummoners = mySummoners.filter(id=>splinters.includes(summonerColor(id)))
        return myAvailableSummoners || mySummoners;             
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
let account = '';

const getBattlesWithRuleset = (ruleset, mana, summoners) => {
    const rulesetEncoded = encodeURIComponent(ruleset);
    console.log(process.env.API)
    const host = process.env.API || 'https://splinterlands-data-service.herokuapp.com/'
//    const host = 'http://localhost:3000/'
    let url = ''
    if (process.env.API_VERSION == 2) {
        url = `V2/battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${account}&token=${process.env.TOKEN}&summoners=${summoners ? JSON.stringify(summoners) : ''}`;
    } else {
        url = `battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${account}&token=${process.env.TOKEN}&summoners=${summoners ? JSON.stringify(summoners) : ''}`;
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
    const mySummoners = getSummoners(cards,matchDetails.splinters);
    console.log('INPUT: ', matchDetails.mana, matchDetails.rules, matchDetails.splinters, cards.length)
    return cardsIdsforSelectedBattles(matchDetails.mana, matchDetails.rules, matchDetails.splinters, mySummoners)
        .then(x => x.filter(
            x => availabilityCheck(cards, x))
            .map(element => element)//cards.cardByIds(element)
        )

}

const possibleTeams = async (matchDetails, acc) => {
    let possibleTeams = [];
    while (matchDetails.mana > 10) {
        if (matchDetails.mana === 98) {
            matchDetails.mana = 45;
        }
        console.log('check battles based on mana: '+matchDetails.mana);
        account = acc;
        possibleTeams = await askFormation(matchDetails);
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

const teamSelection = async (possibleTeams, matchDetails, quest, favouriteDeck) => {
    let priorityToTheQuest = process.env.QUEST_PRIORITY === 'false' ? false : true;
    //TEST V2 Strategy ONLY FOR PRIVATE API
    if (process.env.API_VERSION == 2 && possibleTeams[0][8]) {
        // check dragons and remove the non playable:
        const removedUnplayableDragons = possibleTeams.filter(team=>team[7]!=='dragon' || matchDetails.splinters.includes(helper.teamActualSplinterToPlay(team?.slice(0, 6)).toLowerCase()))
        //force favouriteDeck play:
        if(favouriteDeck && matchDetails.splinters.includes(favouriteDeck?.toLowerCase())) {
            const filteredTeams = removedUnplayableDragons.filter(team=>team[7]===favouriteDeck)
            console.log('play splinter:', favouriteDeck, 'from ', filteredTeams?.length, 'teams')
            if(filteredTeams && filteredTeams.length >= 1 && filteredTeams[0][8]) {
                console.log('play deck:', filteredTeams[0])
                return { summoner: filteredTeams[0][0], cards: filteredTeams[0] };
            }
            console.log('No possible teams for splinter',favouriteDeck)
        }

        //check quest for private api V2:
        if(priorityToTheQuest && removedUnplayableDragons.length > 25 && quest && quest.total) {
            const left = quest.total - quest.completed;
            const questCheck = matchDetails.splinters.includes(quest.splinter) && left > 0;
            const filteredTeams = removedUnplayableDragons.filter(team=>team[7]===quest.splinter)
            console.log(left + ' battles left for the '+quest.splinter+' quest')
            console.log('play for the quest ',quest.splinter,'? ',questCheck)
            if(left > 0 && filteredTeams && filteredTeams.length >= 1 && splinters.includes(quest.splinter) && filteredTeams[0][8]) {
                console.log('PLAY for the quest with Teams size: ',filteredTeams.length, 'PLAY: ', filteredTeams[0])
                return { summoner: filteredTeams[0][0], cards: filteredTeams[0] };
            }
        }
        const filteredTeams = removedUnplayableDragons.filter(team=>matchDetails.splinters.includes(helper.teamActualSplinterToPlay(team?.slice(0, 6)).toLowerCase()))
        console.log('play the most winning: ', filteredTeams[0])
        return { summoner: filteredTeams[0][0], cards: filteredTeams[0] };
    }
    

    //check if daily quest is not completed
    console.log('quest custom option set as:', process.env.QUEST_PRIORITY)
    if(priorityToTheQuest && possibleTeams.length > 25 && quest && quest.total) {
        const left = quest.total - quest.completed;
        const questCheck = matchDetails.splinters.includes(quest.splinter) && left > 0;
        const filteredTeams = possibleTeams.filter(team=>team[7]===quest.splinter)
        console.log(left + ' battles left for the '+quest.splinter+' quest')
        console.log('play for the quest ',quest.splinter,'? ',questCheck)
        if(left > 0 && filteredTeams && filteredTeams.length > 3 && splinters.includes(quest.splinter)) {
            console.log('PLAY for the quest with Teams size: ',filteredTeams.length)
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
        if (matchDetails.splinters.includes(possibleTeams[i][7]) && helper.teamActualSplinterToPlay(possibleTeams[i]) !== '' && matchDetails.splinters.includes(helper.teamActualSplinterToPlay(possibleTeams[i]?.slice(0, 6)).toLowerCase())) {
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