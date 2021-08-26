# splinterlands-bot

This is my personal project of a BOT to play the game [Splinterlands](https://www.splinterlands.com). It requires [NodeJs](https://nodejs.org/it/download/) installed to run.


## How to start the BOT:


to start BOT login routine. you need to create the .env file and include the username and password (file with no name, only starting dot to create a hidden file) in the root folder, example: 

- `ACCOUNT=youraccountname`
- `PASSWORD=yourpostingpassword`

You can also use the file `.env-example` as a template.

Once the file is created, open cmd (for windows) or terminal (for Mac and Linux) and run:

`npm install`

`npm start`


## Local History backup (battlesGetData.js)

The BOT leverage an API but in case doesn't work, it is possible to have locally an history as a backup.
To generate the file 'history.json' with a unique array with the history of the battles of an array of users (to be specified in the file).

[ OPTIONAL ] run `node battlesGetData.js`

once ran, it will create a file 'history.json' in the data folder. To makes the bot using it, you have to rename it in: 'newHistory.json' 

# FAQ


Q: Can I make the bot running a battle every 2 minutes?
A: Technically yes, but playing too often will decrease the Capture Rate making the rewards very low and insignificant. Try to play a battle every 20 minutes MAX to maintain high level of rewards. Trust me, you keep the ROI higher. Don't be greedy.

Q: Does it play for the daily quest?
A: At the moment the bot consider only the splinters quests (death, dragon, earth, fire, life, water) but not the special one (snipe, sneak, neutral,...). Therefore yes, the bot prioritize the splinter for the quest. Nonetheless if the bot consider more probable to win a battle with another splinter (because for example there are not many possible team for the splinter of the quest), you may see a different card selection sometimes

Q: Can I play multiple accounts?
A: Technically yes, but don't be greedy.

Q: I got the error "cannot read property split of undefined"
A: check that the credentials file doesn't contain any but ".env" in the name. (no .txt or anything else) and check that there is nothing but ACCOUNT=yourusername and PASSWORD=yourpass in 2 lines with no spaces. Also you must use the username with the posting key, and not the email address.

Q: Why the bot doesn't use my best card I paid 1000$?
A: Because the bot select cards based on the statistics of the previous battles choosing the most winning team for your cards. it's a bot, not a thinking human being!

Q: Why the bot doesn't use the Furious Chicken?
A: same as above


# Donations

I've created using my personal free time so if you like it or you benefit from it and would like to be grateful and offer me a beer 🍺 I'll appreciate:

- DEC into the game to the player **splinterlava** 
- Bitcoin bc1qpluvvtty822dsvfza4en9d3q3sl5yhj2qa2dtn
- Ethereum 0x8FA3414DC2a2F886e303421D07bda5Ef45C84A3b 
- Tron TRNjqiovkkfxVSSpHSfGPQoGby1FgvcSaY
- BUSD(ERC20) 0xE4B06BE863fD9bcE1dA30433151662Ea0ecA4a7e

Cheers!

where you can find some support from other people using it:

[Discord](
https://discord.gg/bR6cZDsFSX)

[Telegram chat](https://t.me/splinterlandsbot) 

