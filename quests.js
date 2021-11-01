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

const getPlayerQuest = (username) => (fetch(`https://api2.splinterlands.com/players/quests?username=${username}`,
  { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
  .then(x => x && x.json())
  .then(x => {
      if (x[0]) {
          const questDetails = {name: x[0].name, splinter: getQuestSplinter(x[0].name), total: x[0].total_items, completed: x[0].completed_items}
          return questDetails;
        }})
  .catch(() => {
    console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... ');
    fetch(`https://api.splinterlands.io/players/quests?username=${username}`,
      { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
      .then(x => x && x.json())
      .then(x => {
          if (x[0]) {
              const questDetails = {name: x[0].name, splinter: getQuestSplinter(x[0].name), total: x[0].total_items, completed: x[0].completed_items}
              return questDetails;
            }})
      .catch(e => console.log('[ERROR QUEST] Check if Splinterlands is down. Are you using username or email? please use username'))
  })
)

module.exports.getPlayerQuest = getPlayerQuest;
