const fetch = require("node-fetch");
const fs = require('fs');
const leaderboardUsers = require('./leaderboardUsers');

const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

async function getBattleHistory(player = '', data = {}) {
    const battleHistory = await fetch('https://api2.splinterlands.com/battle/history?player=' + player)
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

let battlesList = [];
let usersToGrab = []

const generateHistory = async () => {
    if(usersToGrab?.length === 0) {
        usersToGrab = await leaderboardUsers.getList()
    }
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
}

generateHistory();