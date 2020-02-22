const cards = require('./getCards.js');

const history = require("./data/history.json");

const battlesFilters = (mana = 99, ruleset = '') => history.filter(battle => battle.mana_cap == mana && (ruleset ? battle.ruleset == ruleset : true))

const cardsIds = (mana,ruleset) => battlesFilters(mana,ruleset)
                                    .map(
                                        x => {console.log(x); return [x.summoner_id,x.monster_1_id,x.monster_2_id,x.monster_3_id,x.monster_4_id,x.monster_5_id,x.monster_6_id]}
                                    )

cardsIds(14,'Close Range').map(element => cards.cardByIds(element))
