const cards = require('./getCards.js');

const history = require("./data/history.json");
//const historyObj = JSON.parse(history);
//console.log(history)

const battlesByMana = (mana) => history.filter(battle => battle.mana_cap == mana)

const mana = 23;
const cardsIds = (mana) => battlesByMana(mana)
                                    .map(
                                        x => [x.summoner_id,x.monster_1_id,x.monster_2_id,x.monster_3_id,x.monster_4_id,x.monster_5_id,x.monster_6_id]
                                    )

console.log(cardsIds(25).map(element => cards.cardByIds(element)))
//Promise.all(battlesByMana(13)).then(x=>console.log(x))

