const fetch = require("node-fetch");
const fs = require('fs');


const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

async function getBattleHistory(player = '', data = {}) {
    const battleHistory = await fetch('https://api.steemmonsters.io/battle/history?player='+player+'&v=1582143214911&token=5C9VPKBVV4&username=a1492dc')
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
player = 'a1492dc'

usersToGrab =  ['aaken','a1492dc','kenchung3','geels','kenchung1','nutus','berindon','funmeko','tomeofsplinters','kenchung7','kenchung6','raferti','pal.aaronli','craftsman252','minnow.helper','xavezar','vyulivsaz','kenchung5']
usersToGrab.forEach(element => {
    getBattleHistory(element)
    .then(battles => battles.map(
        x => {
            const details = JSON.parse(x.details);
            if (JSON.parse(x.details).type != 'Surrender') {
                if (x.winner == x.player_1) {
                    const monster1 = JSON.parse(x.details).team1.monsters[0];
                    const monster2 = JSON.parse(x.details).team1.monsters[1];
                    const monster3 = JSON.parse(x.details).team1.monsters[2];
                    const monster4 = JSON.parse(x.details).team1.monsters[3];
                    const monster5 = JSON.parse(x.details).team1.monsters[4];
                    const monster6 = JSON.parse(x.details).team1.monsters[5];
                    return {
                        battle_queue_id: x.battle_queue_id_1,
                        player_rating_initial: x.player_1_rating_initial,
                        player_rating_final: x.player_1_rating_final,
                        player_name: x.player_1,
                        created_date: x.created_date,
                        match_type: x.match_type,
                        mana_cap: x.mana_cap,
                        current_streak: x.current_streak,
                        ruleset: x.ruleset,
                        inactive: x.inactive,
                        details_team: x.team1,
                        details_prebattle: x.prebattle,
                        summoner_id: JSON.parse(x.details).team1.summoner.card_detail_id,
                        summoner_level: JSON.parse(x.details).team1.summoner.level,
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
                } else if (x.winner == x.player_2) {
                    const monster1 = JSON.parse(x.details).team2.monsters[0];
                    const monster2 = JSON.parse(x.details).team2.monsters[1];
                    const monster3 = JSON.parse(x.details).team2.monsters[2];
                    const monster4 = JSON.parse(x.details).team2.monsters[3];
                    const monster5 = JSON.parse(x.details).team2.monsters[4];
                    const monster6 = JSON.parse(x.details).team2.monsters[5];
                    
                    return {
                        battle_queue_id: x.battle_queue_id_2,
                        player_rating_initial: x.player_2_rating_initial,
                        player_rating_final: x.player_2_rating_final,
                        player_name: x.player_2,
                        created_date: x.created_date,
                        match_type: x.match_type,
                        mana_cap: x.mana_cap,
                        current_streak: x.current_streak,
                        ruleset: x.ruleset,
                        inactive: x.inactive,
                        details_team2: details.team2,
                        details_prebattle: details.prebattle,
                        summoner_id: JSON.parse(x.details).team2.summoner.card_detail_id,
                        summoner_level: JSON.parse(x.details).team2.summoner.level,
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
            }}

        })
    ).then(
        x=> {
                fs.writeFile(`data/${element}.json`, JSON.stringify(x), function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
                x.map(element => 
                    {
                        console.log('elem',element)
                        element && element.player_name ? users.push(element.player_name) : null;
                    }
                );
                console.log(users.filter(distinct))
            }
    )
});
