const fetch = require("node-fetch");
const fs = require('fs');


const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

async function getBattleHistory(player = '', data = {}) {
    const battleHistory = await fetch('https://api.steemmonsters.io/battle/history?player=' + player)
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

users = [];
player = 'berindon'
const battles = getBattleHistory(player)
    .then(battles => battles.map(
        x => {
            const details = JSON.parse(x.details);
            return {
                battle_queue_id_1: x.battle_queue_id_1,
                battle_queue_id_2: x.battle_queue_id_2,
                player_1_rating_initial: x.player_1_rating_initial,
                player_2_rating_initial: x.player_2_rating_initial,
                winner: x.winner,
                player_1_rating_final: x.player_1_rating_final,
                player_2_rating_final: x.player_2_rating_final,
                player_1: x.player_1,
                player_2: x.player_2,
                created_date: x.created_date,
                match_type: x.match_type,
                mana_cap: x.mana_cap,
                current_streak: x.current_streak,
                ruleset: x.ruleset,
                inactive: x.inactive,
                settings: x.settings,
                block_num: x.block_num,
                rshares: x.rshares,
                dec_info: x.dec_info,
                details_team1: details.team1,
                details_team2: details.team2,
                details_prebattle: details.prebattle
            }
        })
    ).then(
        x => {
            fs.writeFile(`data/${player}_Raw.json`, JSON.stringify(x), function (err) {
                if (err) {
                    console.log(err);
                }
            });
            x.map(element => {
                users.push(element.player_2);
                users.push(element.player_1);
            }
            );
            console.log(users.filter(distinct))
        }
    )