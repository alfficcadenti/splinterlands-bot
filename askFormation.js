const cards = require('./getCards.js');

const history = require("./data/newHistory.json");
//const myCards = require('./data/myCards.js');
const myCards = require('./data/splinterlavaCards.js');

let availabilityCheck = (base, toCheck) => toCheck.every(v => base.includes(v));

const battlesFilterByManacap = (mana, ruleset) => history.filter(
    battle =>
        battle.mana_cap == mana &&
        (ruleset ? battle.ruleset === ruleset : true)
)

const cardsIds = (mana, ruleset) => battlesFilterByManacap(mana, ruleset)
    .map(
        (x) => {
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

const manaCap = 22;
const inactive = ['White']

const askFormation = function (matchDetails) {
    console.log('test', matchDetails)
    return cardsIds(matchDetails.mana, matchDetails.rules)
        .filter(
            x => availabilityCheck(myCards, x))
        .map(
            element => element)//cards.cardByIds(element)
}

module.exports.askFormation = askFormation;


// console.log(cardsIds(manaCap,'Reverse Spe ed')
//     .filter(
//         x=> availabilityCheck(myCards,x))
//     .map(
//         element => cards.cardByIds(element)))



//     ).forEach(
//         x => inactive.includes(x)))

// }

// const test = [[ { id: 91, name: 'Creeping Ooze', color: 'Gray' },
// { id: 97, name: 'Goblin Mech', color: 'Gray' },
// { id: 131, name: 'Furious Chicken', color: 'Gray' },
// { id: 158, name: 'Serpentine Spy', color: 'Red' },
// { id: 161, name: 'Fire Elemental', color: 'Red' },
// { id: 167, name: 'Pyre', color: 'Red' },
// { id: 194, name: 'Elven Mystic', color: 'Gray' } ],
// [ { id: 158, name: 'Serpentine Spy', color: 'Red' },
// { id: 161, name: 'Fire Elemental', color: 'Red' },
// { id: 162, name: 'Living Lava', color: 'Red' },
// { id: 167, name: 'Pyre', color: 'Red' },
// { id: 191, name: 'Horny Toad', color: 'Gray' },
// { id: 195, name: 'Goblin Chariot', color: 'Gray' } ]]

// console.log('HERE', test.forEach(formation=> console.log(formation)))

// console.log(test.filter(formation=> availabilityCheck(formation,inactive)))

//console.log('here',cardsIds(99).filter(x=> checker(basicCards,x)))