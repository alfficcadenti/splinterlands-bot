const fetch = require("node-fetch");

const quests = [
    {name: "Defend the Borders", element: "life"},
    {name: "Pirate Attacks", element: "water"},
    {name: "High Priority Targets", element: "snipe"},
    {name: "Lyanna's Call", element: "earth"},
    {name: "Stir the Volcano", element: "fire"},
    {name: "Rising Dead", element: "death"},
    {name: "Stubborn Mercenaries", element: "neutral"},
    {name: "Gloridax Revenge", element: "dragon"},
    {name: "Stealth Mission", element: "sneak"},
]

const getQuestSplinter = (questName) => {
    const playerQuest = quests.find(quest=> quest.name === questName)
    return playerQuest.element;
}

const getPlayerQuest = (username) => (fetch(`https://api.splinterlands.io/players/quests?username=${username}`,
  { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(x => x && x.json())
  .then(x => ({name: x[0].name, splinter: getQuestSplinter(x[0].name), total: x[0].total_items, completed: x[0].completed_items}))
  .catch(e => console.log('[ERROR QUEST]', e))
)

module.exports.getPlayerQuest = getPlayerQuest;
