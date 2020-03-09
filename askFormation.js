const cards = require('./getCards.js');

const history = require("./data/history.json");
const myCards = require('./data/basicCards.js');

let availabilityCheck = (base, toCheck) => toCheck.every(v => base.includes(v));

const battlesFilterByManacap = (mana, ruleset) => history.filter(
    battle => 
        battle.mana_cap == mana && 
        (ruleset ? battle.ruleset == ruleset : true)
    )

const cardsIds = (mana,ruleset) => battlesFilterByManacap(mana,ruleset)
                                    .map(
                                        (x,idx) => {
                                            console.log(x,idx); 
                                            return [
                                                x.summoner_id,
                                                x.monster_1_id,
                                                x.monster_2_id,
                                                x.monster_3_id,
                                                x.monster_4_id,
                                                x.monster_5_id,
                                                x.monster_6_id
                                            ]
                                        }
                                    )


//for (i=13; i<100; i++) {

const manaCap = 26;
const inactive = ['White']


console.log(cardsIds(manaCap)
    .filter(
        x=> availabilityCheck(myCards,x))
    .map(
        element => cards.cardByIds(element)))
    // ).forEach(
    //     x => inactive.includes(x)))
        
//}




//console.log('here',cardsIds(99).filter(x=> checker(basicCards,x)))