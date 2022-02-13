# splinterlands-bot

This is my personal project of a BOT to play the game [Splinterlands](https://www.splinterlands.com). It requires [NodeJs](https://nodejs.org/it/download/) installed to run.


## How to start the BOT:

REQUIREMENT: You need to install NodeJS from https://nodejs.org/en/download/ (at least the last stable version 14.18.0)

Once NodeJS is installed and you downloaded the bot in a specific folder, you need to set your configuration in the .env file:

you need to create the .env file and include the username and posting key (file with no name, only starting dot to create a hidden file) in the bot folder, 

Example: 

- `ACCOUNT=youraccountname`
- `PASSWORD=yourpostingkey`

You can also use the file `.env-example` as a template, but remember to remove `-example` from the filename.

__IMPORTANT:__ the bot needs the __username and posting key__ in order to login. __Don't use the email and password__. If you don't have the posting key, you need to _'Request Keys'_ from the top right menu in Splinterlands. You will receive a link to follow where you will get your Hive private keys. __Store them safely and don't share them with anyone!__  

Once the file is created, open cmd (for windows) or terminal (for Mac and Linux) and run:

`npm install`

and then

`npm start`

There is also a youtube video made by a user that can help windows users with the setup [here](https://youtu.be/MFxV6XeDKec)


If you face issue related to the browser when you run the bot for the first time, be sure you have installed chromium browser. For Linux:
#### install chromium
sudo apt-get install chromium-browser

#### run this if running chromium still fails
sudo apt-get install libpangocairo-1.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libgconf2-4 libasound2 libatk1.0-0 libgtk-3-0 libgbm-dev



### Optional variables:

The BOT will make a battle every 30 minutes by default, you can change the custom value specifying in the .env the variable `MINUTES_BATTLES_INTERVAL`.
The BOT will also try to select team to complete the daily quest by default. If you want to remove this option to increase the winning rate, you can set the variable `QUEST_PRIORITY` as false.
By default, the BOT doesn't check for season rewards but it can automatically click on the seasons reward claim button if available and the `CLAIM_SEASON_REWARD` is set to true. The default option is false.
By default, the BOT checks automatically for daily quest rewards but the claim option can be deactivated with the option `CLAIM_DAILY_QUEST_REWARD` is set to false. The default option is true.
By default, the BOT will run as headless. Set `HEADLESS` to false to see your browser. The default option is true
By default, the BOT will run no matter the ECR level. Set `ECR_STOP_LIMIT` to a specific value you want the bot to rest and recover the ECR. The bot will recover until the `ECR_RECOVER_TO` is reached or until 100% ECR.
If you want the bot to play only one color (when it's possible), use the variable `FAVOURITE_DECK`  and specify the splinter by choosing only one among: fire, life, earth, water, death, dragon. 
If you want the bot to try to skip specific quest types you can include multiple quest in the variable `SKIP_QUEST` separated by the comma (`SKIP_QUEST=life,snipe,neutral`). whenever it's possible, the bot will click to ask for a new one. Remember you can only ask for a new one once based on the game rules.
If you want the bot to prioritize teams that uses delegated cards, set the variable `DELEGATED_CARDS_PRIORITY`  equal to `true`.
To avoid to sue the API solution and rely only on your local history json file created as per instructions below (Local History backup), you can set the variable `FORCE_LOCAL_HISTORY=true`.

Example:

- `QUEST_PRIORITY=false`

- `MINUTES_BATTLES_INTERVAL=30`

- `CLAIM_SEASON_REWARD=true`

- `CLAIM_DAILY_QUEST_REWARD=false`

- `HEADLESS=false`

- `ECR_STOP_LIMIT=50`

- `ECR_RECOVER_TO=99`

- `FAVOURITE_DECK=dragon`

- `SKIP_QUEST=life,snipe,neutral`

- `DELEGATED_CARDS_PRIORITY=true`

- `FORCE_LOCAL_HISTORY=true`


### Running bot with multiaccount setting

in order to run multple accounts launching the script only once, you can simply add the list of usernames and posting keys in the .env file and set the variable `MULTI_ACCOUNT` as true:

- `MULTI_ACCOUNT=true`
- `ACCOUNT=user1,user2,user,...`
- `PASSWORD=postingkey1,postingkey2,postingkey3,...`

### Running bot as a daemon with PM2

To run your bot as a daemon (background process) you can use NPM package PM2. PM2 is daemon process manager, that works on Linux, MacOS, and Windows. To install PM2 globally, you need to run:

# `npm install pm2 -g`

To start a bot, do all the preparation steps from the above, but instead of `npm start`, run this:

`pm2 start main.js`

You can now run `pm2 list` command to see your bot up and running. It will automatically start on system startup now. You can control the bot with these commands:

`pm2 start <id>`

`pm2 stop <id>`

`pm2 restart <id>`

`pm2 delete <id>`

You can find more information on PM2 usage options at their [official webiste](https://pm2.keymetrics.io/).


### Running the bot in a docker container

docker instructions:

1. first, you need to install docker https://docs.docker.com/get-docker/
2. open your terminal/command line
3. cd into your bot directory
4. build the image
-> `docker build -t your_image_name -f Dockerfile .`
5. then run a container based on the image
-> `docker run -it your_image_name bash`
6. the 5th step will get you inside your container, use nano or vim to edit your .env file and make sure to uncomment CHROME_EXEC
7. finally, run
-> `npm start`



## Local History backup (battlesGetData.js)

The BOT leverages an API on a free server but in case the traffic is heavy or it doesn't work, it is possible to have locally an history as a backup solution that the bot will read automatically.
To generate the file 'history.json' with a unique array with the history of the battles of an array of users specified in the file.

[ OPTIONAL ] run this command from the terminal:

`node battlesGetData.js`

Once the script is done, it will create a file 'history.json' in the data folder. To makes the bot using it, you have to rename it in: 'newHistory.json' 

**How to get history data from users of my choice?**

1. Open battlesGetData.js in notepad and change the usersToGrab on line 69 to aa list of users of your choice like: `let usersToGrab = ['player1','player2']`
2. Run `node battlesGetData.js` in the bot folder
3. File history.json is created, rename it to newHistory.json to replace the existing history data OR extend the newHistory.json file with `combine.js` (see below)

**How to extend the newHistory.json without deleting existing data?**

1. Backup newHistory.json in case something goes wrong
2. Run `node combine.js` to add the new data from history.json to the newHistory.json file that will be used by the bot


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

