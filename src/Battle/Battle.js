const fetch = require("node-fetch");
const { Pool } = require('pg')

async function getPlayerBattlesHistory(player = '') {
    return await fetch('https://api.steemmonsters.io/battle/history?player=' + player + '&v=1582143214911&token=5C9VPKBVV4&username=' + process.env.ACCOUNT.split('@')[0])
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((response) => {
            if (!response.battles || !response.battles.length) {
                throw new Error('No battles');
            }
            return response.battles;
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
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

const extractBattleDetails = (battle) => {
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
}

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'splinterlands',
    password: 'docker',
    port: 5432,
    max: 100,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const makeInsertQuery = (battleDetails) => "INSERT INTO battles (summoner_id, summoner_level, monster_1_id, monster_1_level,monster_1_abilities, monster_2_id, monster_2_level, monster_2_abilities, monster_3_id, monster_3_level, monster_3_abilities, monster_4_id, monster_4_level, monster_4_abilities, monster_5_id, monster_5_level, monster_5_abilities, monster_6_id, monster_6_level, monster_6_abilities, created_date, match_type, mana_cap, ruleset, inactive, battle_queue_id, player_rating_initial, player_rating_final, winner) VALUES('" + Object.values(battleDetails).join("','") + "') ON CONFLICT (battle_queue_id) DO NOTHING;"

async function writeDB() {
    await pool.connect();
    await getPlayerBattlesHistory(process.env.ACCOUNT.split('@')[0])
        .then((result) => {
            console.log('TOTAL ROWS: ', result.length)
            result.map(
                async battle => {
                    if (extractBattleDetails(battle)) {
                        console.log(makeInsertQuery(extractBattleDetails(battle)))
                        await pool.query(makeInsertQuery(extractBattleDetails(battle)))
                            .then(dbResult => console.log(dbResult.rowCount))
                            .catch(e => console.error('ERR: ', e.stack))
                    }
                }
            )
        })
        .then((res) => console.log("OK: ", res))
        .catch(e => console.log('ERROR: ', e))
    await pool.end()
}

writeDB();
