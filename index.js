//'use strict';
require('dotenv').config()
var cron = require('node-cron');
const puppeteer = require('puppeteer');

const splinterlandsPage = require('./splinterlandsPage');
const user = require('./user');
const battles = require('./battles');
const cardsDetails = require("./data/cardsDetails.json"); //saved json from api endpoint https://game-api.splinterlands.com/cards/get_details?
const card = require('./cards');
const helper = require('./helper');

const ask = require('./possibleTeams');

async function startBotPlayMatch() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1500,
        height: 800,
        deviceScaleFactor: 1,
    });

    await page.goto('https://splinterlands.io/');
    await page.waitFor(4000);
    await splinterlandsPage.login(page);
    await page.waitFor(10000);

    // LOAD MY CARDS
    const myCards = await user.getPlayerCards(process.env.ACCOUNT.split('@')[0])

    // LAUNCH the battle
    await page.waitForXPath("//button[contains(., 'RANKED')]", { timeout: 10000 })
        .then(button => button.click());
    await page.waitFor(30000);

    await page.waitForSelector('.btn--create-team', { timeout: 90000 })
        //then read rules and details 
        .then(async () => {
            let [mana, rules, splinters] = await Promise.all([
                splinterlandsPage.checkMatchMana(page).then((mana) => mana).catch(() => 'no mana'),
                splinterlandsPage.checkMatchRules(page).then((rulesArray) => rulesArray).catch(() => 'no rules'),
                splinterlandsPage.checkMatchActiveSplinters(page).then((splinters) => splinters).catch(() => 'no splinters')
            ]);
            return { 
                mana: mana, 
                rules: rules, 
                splinters: splinters, 
                myCards: myCards 
            }
        })
        .then((matchDetails) => [ask.possibleTeams(matchDetails), matchDetails])
        .then(([possibleTeams, matchDetails]) => {
            if (possibleTeams) {
                page.click('.btn--create-team')[0];
                return [possibleTeams, matchDetails]
            }
            page.click('.btn--surrender')[0];
            console.log('NO TEAMS');
            throw new Error('no team available to be played');
        })
        .then(async ([possibleTeams, matchDetails]) => {
            possibleTeams && possibleTeams.length ? 
                console.log('Possible Teams: ', possibleTeams.length) : 
                console.log('NO TEAMS');
            
            const bestCombination = battles.mostWinningSummonerTank(possibleTeams)
            console.log('BEST SUMMONER and TANK', bestCombination)
            if (bestCombination.summonerWins > 1) {
                const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner)
                console.log('BEST TEAM', bestTeam)
                if (matchDetails.splinters.includes(helper.teamSplinterToPlay(bestTeam).toLowerCase())) {
                    console.log('PLAY BEST SUMMONER and TANK: ', helper.teamSplinterToPlay(bestTeam), bestTeam)
                    const summoner = card.makeCardId(bestTeam[0].toString());
                    return [summoner, bestTeam];
                }

            }

            //TO UNCOMMENT FOR QUEST after choose the color
            if (matchDetails.splinters.includes('fire') && possibleTeams.find(x => x[7] === 'fire')) {
                const fireTeam = possibleTeams.find(x => x[7] === 'fire')
                try {
                    if (matchDetails.splinters.includes(helper.teamSplinterToPlay(fireTeam).toLowerCase())) {
                        console.log('PLAY fire: ', helper.teamSplinterToPlay(fireTeam), fireTeam)
                        const summoner = card.makeCardId(fireTeam[0].toString());
                        return [summoner, fireTeam];
                    }
                    //console.log('fire but deck not active')

                } catch (e) {
                    console.log('fire DECK ERROR: ', e)
                }
            }


            let i = 0;
            while (i <= possibleTeams.length - 1) {
                if (matchDetails.splinters.includes(possibleTeams[i][7])) {
                    console.log('SELECTED: ', possibleTeams[i]);
                    const summoner = card.makeCardId(possibleTeams[i][0].toString());
                    return [summoner, possibleTeams[i]]
                }
                console.log('DISCARDED: ', possibleTeams[i])
                i++;
            }
            throw new Error('no team available to be played');
        }) //select 
        .then(async ([summoner, team]) => {
            await page.waitForSelector(summoner);
            await page.click(summoner)
            try {
                console.log(card.color(team[0]))
                if (card.color(team[0]) === 'Gold') {
                    console.log('TEAMCOLOR', helper.teamSplinterToPlay(team))
                    await page.waitForXPath(`//div[@data-original-title="${helper.teamSplinterToPlay(team)}"]`, 5000).then(selector => selector.click())
                }
            } catch (e) {
                console.log('ERROR AFTER Summoner: ', e)
            }
            await page.waitForSelector(card.makeCardId(team[1].toString()));
            await page.click(card.makeCardId(team[1].toString()));
            await page.waitFor(1000);
            await team[2] ? page.waitForSelector(card.makeCardId(team[2].toString()), { timeout: 3000 }).then(selector => selector.click()) : console.log('nocard 2');
            await page.waitFor(1000);
            await team[3] ? page.waitForSelector(card.makeCardId(team[3].toString()), { timeout: 3000 }).then(selector => selector.click()) : console.log('nocard 3');
            await page.waitFor(1000);
            await team[4] ? page.waitForSelector(card.makeCardId(team[4].toString()), { timeout: 3000 }).then(selector => selector.click()) : console.log('nocard 4');
            await page.waitFor(1000);
            await team[5] ? page.waitForSelector(card.makeCardId(team[5].toString()), { timeout: 3000 }).then(selector => selector.click()) : console.log('nocard 5');
            await page.waitFor(1000);
            await team[6] ? page.waitForSelector(card.makeCardId(team[6].toString()), { timeout: 3000 }).then(selector => selector.click()) : console.log('nocard 6');
            await page.waitFor(3000);
            await page.click('.btn-green')[0]; //start fight
            await page.waitFor(5000);
            console.log('DONE')
            browser.close();
        })
        .catch((e) => { console.log('Error! ', e); browser.close() })
    await browser.close()
}

// cron.schedule('*/5 * * * *', () => {
//     try {
//         startBotPlayMatch();
//     }
//     catch (e) {
//         console.log('END Error: ', e);
//     }
// });

startBotPlayMatch();