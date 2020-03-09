'use strict';
const fetch = require("node-fetch");

async function getCards() {
    return await fetch("https://game-api.splinterlands.io/cards/get_details?v=1582322601277", {"credentials":"omit","headers":{"accept":"application/json, text/javascript, */*; q=0.01","accept-language":"en-GB,en-US;q=0.9,en;q=0.8"},"referrer":"https://splinterlands.io/?p=collection&a=a1492dc","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"})
        .then((response) => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response;
        })
        .then((cards) => {
            return cards.json();
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

const cardByIds = (ids = []) => {
    return getCards()
        .then(inventory => inventory.filter(card => ids.includes(card.id))
            ).then(x=> x.map((y) => ({
                'id': y.id,
                'name': y.name,
                'color': y.color})
                )).then(x=> console.log(x));
}

//example get card id [1,145,167]
//cards([1,145,167]);

exports.cardByIds = cardByIds;