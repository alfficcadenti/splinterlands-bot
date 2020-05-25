const fetch = require("node-fetch");
const fs = require('fs');


const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

async function getBattleHistory(player = '', data = {}) {
    const battleHistory = await fetch('https://api.steemmonsters.io/battle/history?player=' + player + '&v=1582143214911&token=5C9VPKBVV4&username=a1492dc')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response;
        })
        .then((battleHistory) => {
            return battleHistory.json();
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    return battleHistory.battles;
}

const extractGeneralInfo = (x) => {
    return {
        created_date: x.created_date ? x.created_date : '',
        match_type: x.match_type ? x.match_type : '',
        mana_cap: x.mana_cap ? x.mana_cap : '',
        ruleset: x.ruleset ? x.ruleset : '',
        inactive: x.inactive ? x.inactive : ''
    }
}

const extractMonster = (team) => {
    const monster1 = team.monsters[0];
    const monster2 = team.monsters[1];
    const monster3 = team.monsters[2];
    const monster4 = team.monsters[3];
    const monster5 = team.monsters[4];
    const monster6 = team.monsters[5];

    return {
        summoner_id: team.summoner.card_detail_id,
        summoner_level: team.summoner.level,
        monster_1_id: monster1 ? monster1.card_detail_id : '',
        monster_1_level: monster1 ? monster1.level : '',
        monster_1_abilities: monster1 ? monster1.abilities : '',
        monster_2_id: monster2 ? monster2.card_detail_id : '',
        monster_2_level: monster2 ? monster2.level : '',
        monster_2_abilities: monster2 ? monster2.abilities : '',
        monster_3_id: monster3 ? monster3.card_detail_id : '',
        monster_3_level: monster3 ? monster3.level : '',
        monster_3_abilities: monster3 ? monster3.abilities : '',
        monster_4_id: monster4 ? monster4.card_detail_id : '',
        monster_4_level: monster4 ? monster4.level : '',
        monster_4_abilities: monster4 ? monster4.abilities : '',
        monster_5_id: monster5 ? monster5.card_detail_id : '',
        monster_5_level: monster5 ? monster5.level : '',
        monster_5_abilities: monster5 ? monster5.abilities : '',
        monster_6_id: monster6 ? monster6.card_detail_id : '',
        monster_6_level: monster6 ? monster6.level : '',
        monster_6_abilities: monster6 ? monster6.abilities : ''
    }
}

let users = [];
let battlesList = [];
usersToGrab = ['lyannacall', 'bitcocos', 'aaken', 'a1492dc', 'kenchung3', 'geels', 'mamacoco', 'kenchung1', 'nutus', 'funmeko', 'tomeofsplinters', 'kenchung7', 'kenchung6', 'raferti', 'pal.aaronli', 'craftsman252', 'minnow.helper', 'xavezar', 'vyulivsaz', 'kenchung5', 'algoisup', 'makspowerbro11', 'fishbb', 'mitbbs', 'cnlifes', 'nicteel', 'gopota', 'amaz0n', 'rasam', 'longhash', 'b0ra', 'littlex', 'blackbacked-gull', 'makspowerbro11', 'cardbank', 'glitterpatrol', 'a3a', 'glitterbanjo', 'bbdragon', 'glitterunicorn', 'makspowerbro13', 'fishcc', 'tricolored-heron', 'olive-garden', 'audouins-gull', 'slaty-egret', 'crested-ibis', 'oriental-stork', 'zooma', 'keivinzhang', 'eist', 'newterra', 'jusyyy', 'hyperlexic', 'ruffrule', 'ffbank', 'gogoabc', 'milotheo', 'pkrpro', 'tuffstuff', 'davidchen', 'steeemmonsters', 'vddragon', 'jun0', 'bulerigid', 'orange-pie', 'jegewav', 'tyreen', 'aaronli', 'ma0', 'wamele', 'pas0', 'odgar', 'vault-hunter', 'yexalen', 'kgame', 'yellowleg-gull', 'passthestixxx', 'helpful-hexagon', 'sher10ck', 'botapkesc', 'marad0na', 'rus10-bot', 'romba', 'agentsmith1', 'veritasvav', 'bagg1ns', 'mayiude', 'feduk', 'conali', 'rus19-bot', 'rasfel', 'gleaming-glacier', 'ferpri', 'queenquit', 'sgon', 'py0', 'annettee', 'aga0', 'so1o', 'senat0r', 'whitenaped-crane', 'creationlogic', 'rus02-bot', 'elianite', 'bulerigid', 'smonbear', 'mikan-milkshake', 'anttila', 'generalgrevious', 'th12-toy', 'helpful-hexagon', 'mandarin-mustard', 'kumquat-cake', 'trevormomo', 'dnflsms', 'sembioz', 'mi2', 'alliedforce', 'lostkluster', 'h-monsters', 'coinopoly', 'tyreen', 'bbdragon', 'rasfel', 'birka', 'elari', 'biuiam', 'zollyci', 'badboy123', 'diegomontana', 'matt-sm', 'fundsaresafu', 'kenchung', 'raymonda', 'croblin', 'llgod', 'bu3no', 'iniedowa', 'dadawada', 'widajster', 'hkupvotebot', 'jianan', 'helimai', 'huiwilkins2', 'yuwineryyuvia', 'numbass', 'deepcrypti8', 'yeilin', 'wilhb83', 'yamaa', 'yoyonick', 'mybot', 'wilhb84', 'wilhb82', 'wilhb81']
//usersToGrab =  ['aaken','a1492dc','hellobot','pal.aaronli','mamacoco'];
const battles = usersToGrab.map(user =>
    getBattleHistory(user)
        .then(battles => battles.map(
            battle => {
                const details = JSON.parse(battle.details);
                if (details.type != 'Surrender') {
                    if (battle.winner && battle.winner == battle.player_1) {
                        const monstersDetails = extractMonster(details.team1)
                        const info = extractGeneralInfo(battle)
                        return {
                            ...monstersDetails,
                            ...info,
                            battle_queue_id: battle.battle_queue_id_1,
                            player_rating_initial: battle.player_1_rating_initial,
                            player_rating_final: battle.player_1_rating_final,
                            winner: battle.player_1,

                        }
                    } else if (battle.winner && battle.winner == battle.player_2) {
                        const monstersDetails = extractMonster(details.team2)
                        const info = extractGeneralInfo(battle)
                        return {
                            ...monstersDetails,
                            ...info,
                            battle_queue_id: battle.battle_queue_id_2,
                            player_rating_initial: battle.player_2_rating_initial,
                            player_rating_final: battle.player_2_rating_final,
                            winner: battle.player_2,
                        }
                    }
                }

            })
        ).then(x => battlesList = [...battlesList, ...x])
)

Promise.all(battles).then(() => {
    const cleanBattleList = battlesList.filter(x => x != undefined)
    fs.writeFile(`data/history.json`, JSON.stringify(cleanBattleList), function (err) {
        if (err) {
            console.log(err);
        }
    });
});