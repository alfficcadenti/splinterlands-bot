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
    try {
        const rulesetEncoded = encodeURIComponent(ruleset);
        const host = process.env.API || 'http://95.179.236.23/'
        let url = ''
        if (process.env.API_VERSION == 2) {
            url = `V2/battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${account}&token=${process.env.TOKEN}&summoners=${summoners ? JSON.stringify(summoners) : ''}`;
        } else {
            url = `V1/battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${account}&token=${process.env.TOKEN}&summoners=${summoners ? JSON.stringify(summoners) : ''}`;
        }
        console.log('API call: ', host+url)
        return fetch(host+url, { timeout: 10000 })
            .then(x => x && x.json())
            .then(data => data)
            .catch((e) => console.log('fetch ', e))

    } catch (e) {
        console.log('Error API did not return')
    }

}

const battlesFilterByManacap = async (mana, ruleset, summoners) => {
    let forceLocalHistory = process.env.FORCE_LOCAL_HISTORY === 'false' ? false : true;
    let history = [];
    if(!forceLocalHistory) {
        history = await getBattlesWithRuleset(ruleset, mana, summoners);
    }
    
    if (history && history?.length) {
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

const filterOutUnplayableDragonsAndUnplayableSplinters = (teams = [], matchDetails) => {
    const filteredTeamsForAvailableSplinters = Array.isArray(teams) && teams.filter(team=>(team[7]!=='dragon' && matchDetails.splinters.includes(team[7])) || (team[7]==='dragon' && matchDetails.splinters.includes(helper.teamActualSplinterToPlay(team?.slice(0, 6)).toLowerCase())))
    return filteredTeamsForAvailableSplinters || teams;
}

const filterPreferredCardsTeams = (teams = [], preferredCards = []) => teams.filter(team => team.slice(0,6).some(card => preferredCards.includes(card)))

const teamSelection = async (possibleTeams, matchDetails, quest, favouriteDeck) => {
    let priorityToTheQuest = process.env.QUEST_PRIORITY === 'false' ? false : true;
    console.log('quest custom option set as:', priorityToTheQuest)
    const availableTeamsToPlay = await filterOutUnplayableDragonsAndUnplayableSplinters(possibleTeams ,matchDetails);
    let filterPreferredTeams = [];
    if(process.env.DELEGATED_CARDS_PRIORITY === 'true') filterPreferredTeams = await filterPreferredCardsTeams(availableTeamsToPlay,matchDetails?.preferredCards)

    //CHECK FOR QUEST:
    if(priorityToTheQuest && availableTeamsToPlay.length > 10 && quest && quest.total) {
        const left = quest.total - quest.completed;
        const questCheck = matchDetails.splinters.includes(quest.splinter) && left > 0;
        const filteredTeamsForQuest = availableTeamsToPlay.filter(team=>team[7]===quest.splinter)
        const filteredTeamsPreferredCardsForQuest = filterPreferredTeams.filter(team=>team[7]===quest.splinter)
        console.log(left + ' battles left for the '+quest.splinter+' quest')
        console.log('play for the quest ',quest.splinter,'? ',questCheck)

        //QUEST FOR V2
        if (process.env.API_VERSION == 2 && availableTeamsToPlay[0][8]) {
            console.log('V2 try to play for the quest?')
            if(left > 0 && filteredTeamsPreferredCardsForQuest?.length >= 1 && questCheck && filteredTeamsPreferredCardsForQuest[0][8]) {
                console.log('PLAY for the quest with Teams choice of size (V2): ',filteredTeamsPreferredCardsForQuest.length, 'PLAY this with preferred cards: ', filteredTeamsPreferredCardsForQuest[0])
                return { summoner: filteredTeamsPreferredCardsForQuest[0][0], cards: filteredTeamsPreferredCardsForQuest[0] };
            } else if(left > 0 && filteredTeamsForQuest?.length >= 1 && questCheck && filteredTeamsForQuest[0][8]) {
                console.log('PLAY for the quest with Teams choice of size (V2): ',filteredTeamsForQuest.length, 'PLAY this: ', filteredTeamsForQuest[0])
                return { summoner: filteredTeamsForQuest[0][0], cards: filteredTeamsForQuest[0] };
            } else {
                console.log('quest already completed or not enough teams for the quest (V2)')
            }
        } else if (process.env.API_VERSION!=2 && availableTeamsToPlay[0][0]) {
            // QUEST FOR V1
            console.log('play quest for V1')
            if(left > 0 && filteredTeamsPreferredCardsForQuest?.length) {
                console.log('Try to play for the quest with Teams size (V1): ',filteredTeamsPreferredCardsForQuest.length)
                console.log("TEAMS:", filteredTeamsPreferredCardsForQuest)
                const res = await mostWinningSummonerTankCombo(filteredTeamsPreferredCardsForQuest, matchDetails);
                if (res[0] && res[1]) {
                    console.log('Play this with preferred cards for the quest:', res)
                    return { summoner: res[0], cards: res[1] };
                }
            }

            if(left > 0 && filteredTeamsForQuest?.length > 3 && splinters.includes(quest.splinter)) {
                console.log('Try to play for the quest with Teams size (V1): ',filteredTeamsForQuest.length)
                const res = await mostWinningSummonerTankCombo(filteredTeamsForQuest, matchDetails);
                if (res[0] && res[1]) {
                    console.log('Play this for the quest:', res)
                    return { summoner: res[0], cards: res[1] };
                } else {
                    console.log('not enough teams for the quest (V1)')
                }
            }
        }
    }
    
    //CHECK for Favourite DECK
    const favDeckfilteredTeams = availableTeamsToPlay.filter(team=>team[7]===favouriteDeck)
    if(favDeckfilteredTeams?.length && favouriteDeck && matchDetails.splinters.includes(favouriteDeck?.toLowerCase())) {
        //FAV DECK FOR V2
        if (process.env.API_VERSION == 2 && availableTeamsToPlay?.[0]?.[8]) {
            console.log('play splinter:', favouriteDeck, 'from ', favDeckfilteredTeams?.length, 'teams fro V2')
            if(favDeckfilteredTeams && favDeckfilteredTeams?.length >= 1 && favDeckfilteredTeams[0][8]) {
                console.log('play this as favourite deck for V2:', favDeckfilteredTeams[0])
                return { summoner: favDeckfilteredTeams[0][0], cards: favDeckfilteredTeams[0] };
            }
            console.log('No possible teams for splinter ',favouriteDeck, ' V2')
        } else if (process.env.API_VERSION!=2 && favDeckfilteredTeams[0][0]) {
            // FAV DECK FOR V1
            console.log('play splinter:', favouriteDeck, 'from ', favDeckfilteredTeams?.length, 'teams from V1')
            if(favDeckfilteredTeams && favDeckfilteredTeams?.length >= 1 && favDeckfilteredTeams[0][0]) {


                const res = await mostWinningSummonerTankCombo(favDeckfilteredTeams, matchDetails);
                if (res[0] && res[1]) {
                    console.log('play this as favourite deck for V1:', res)
                    return { summoner: res[0], cards: res[1] };
                } else {
                    console.log('not enough teams for the favourite deck (V1)')
                }
            }
            console.log('No possible teams for splinter ',favouriteDeck, ' V1')
        }
    }

    //V2 Strategy ONLY FOR PRIVATE API
    if (process.env.API_VERSION == 2 && availableTeamsToPlay?.[0]?.[8]) {
        if(filterPreferredTeams?.length) {
            console.log('play the highest winning rate team with preferred cards: ', filterPreferredTeams[0])
            return { summoner: filterPreferredTeams[0][0], cards: filterPreferredTeams[0] };
        }
        else if(availableTeamsToPlay?.length) {
            console.log('play the highest winning rate team: ', availableTeamsToPlay[0])
            return { summoner: availableTeamsToPlay[0][0], cards: availableTeamsToPlay[0] };
        }
        else {
            console.log('NO available team to be played for V2');
            return null;
        }
    } else if (process.env.API_VERSION!=2 && availableTeamsToPlay[0][0]) {
        //V1 Strategy
        //find best combination (most used)
        if(filterPreferredTeams?.length) {
            const res = await mostWinningSummonerTankCombo(filterPreferredTeams, matchDetails);
            if (res[0] && res[1]) {
                console.log('Dont play for the quest, and play this with preferred cards:', res)
                return { summoner: res[0], cards: res[1] };
            }
        }
        const res = await mostWinningSummonerTankCombo(availableTeamsToPlay, matchDetails);
        if (res[0] && res[1]) {
            console.log('Dont play for the quest, and play this:', res)
            return { summoner: res[0], cards: res[1] };
        }
    }

    
    console.log('No available team to be played...')
    return null
}


module.exports.possibleTeams = possibleTeams;
module.exports.teamSelection = teamSelection;