//'use strict';
require('dotenv').config()
const puppeteer = require('puppeteer');

const splinterlandsPage = require('./splinterlandsPage');
const user = require('./user');
const card = require('./cards');
const helper = require('./helper');
const quests = require('./quests');
const ask = require('./possibleTeams');

// LOAD MY CARDS
async function getCards() {
    const myCards = await user.getPlayerCards(process.env.ACCOUNT.split('@')[0]) //split to prevent email use
    return myCards;
} 

async function getQuest() {
    return quests.getPlayerQuest(process.env.ACCOUNT.split('@')[0])
        .then(x=>x)
        .catch(e=>console.log('No quest data'))
}

async function startBotPlayMatch(page, myCards, quest) {
    
    console.log( new Date().toLocaleString())
    if(myCards) {
        console.log(process.env.ACCOUNT, ' deck size: '+myCards.length)
    }
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.setViewport({
        width: 1800,
        height: 1500,
        deviceScaleFactor: 1,
    });

    await page.goto('https://splinterlands.io/');
    await page.waitForTimeout(4000);

    let item = await page.waitForSelector('#log_in_button > button', {
        visible: true,
      })
      .then(res => res)
      .catch(()=> console.log('Already logged in'))

    if (item != undefined)
    {console.log('Login')
        await splinterlandsPage.login(page).catch(e=>console.log('Login Error: ',e));
    }
    
    await page.waitForTimeout(5000);
    await page.reload();
    await page.waitForTimeout(5000);
    await page.reload();
    await page.waitForTimeout(5000);

    await page.click('#menu_item_battle').catch(e=>console.log('Battle not available'));

    console.log('Quest: ', quest);
    //if quest done claim reward
    try {
        await page.waitForSelector('#quest_claim_btn', { timeout: 5000 })
            .then(button => button.click());
    } catch (e) {
        console.log('no quest reward to be claimed')
    }

    await page.waitForTimeout(3000);

    // LAUNCH the battle
    await page.waitForXPath("//button[contains(., 'BATTLE')]", { timeout: 20000 })
        .then(button => button.click())
        .catch(e=>console.log('[ERROR waiting for Battle button]'));
    await page.waitForTimeout(15000);

    await page.waitForSelector('.btn--create-team', { timeout: 240000 })
        .catch(async e=> {
            console.log('[Error while waiting for battle]',e);
            // refresh the page and retry to battle
            await page.reload();
            await page.waitForTimeout(3000);
            await page.waitForXPath("//button[contains(., 'BATTLE')]", { timeout: 10000 })
                .then(button => button.click());
            await page.waitForTimeout(5000);
            await page.waitForSelector('.btn--create-team', { timeout: 90000 })
        })
    await page.waitForTimeout(10000);
    let [mana, rules, splinters] = await Promise.all([
        splinterlandsPage.checkMatchMana(page).then((mana) => mana).catch(() => 'no mana'),
        splinterlandsPage.checkMatchRules(page).then((rulesArray) => rulesArray).catch(() => 'no rules'),
        splinterlandsPage.checkMatchActiveSplinters(page).then((splinters) => splinters).catch(() => 'no splinters')
    ]);

    const matchDetails = {
        mana: mana,
        rules: rules,
        splinters: splinters,
        myCards: myCards
    }
    await page.waitForTimeout(2000);
    const possibleTeams = await ask.possibleTeams(matchDetails).catch(e=>console.log('Error from possible team API call: ',e));

    if (possibleTeams && possibleTeams.length) {
        console.log('Possible Teams: ', possibleTeams.length, '\n', possibleTeams);
    } else {
        console.log('Error:', matchDetails, possibleTeams)
        throw new Error('NO TEAMS available to be played');
    }
    
    //TEAM SELECTION
    const teamToPlay = await ask.teamSelection(possibleTeams, matchDetails, quest);

    if (teamToPlay) {
        page.click('.btn--create-team')[0];
    } else {
        throw new Error('Team Selection error');
    }
    await page.waitForTimeout(5000);
    try {
        await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, { timeout: 3000 }).then(summonerButton => summonerButton.click());
        if (card.color(teamToPlay.cards[0]) === 'Gold') {
            console.log('Dragon play TEAMCOLOR', helper.teamActualSplinterToPlay(teamToPlay.cards))
            await page.waitForXPath(`//div[@data-original-title="${helper.teamActualSplinterToPlay(teamToPlay.cards)}"]`, { timeout: 8000 }).then(selector => selector.click())
        }
        await page.waitForTimeout(5000);
        for (i = 1; i <= 6; i++) {
            console.log('play: ', teamToPlay.cards[i].toString())
            await teamToPlay.cards[i] ? page.waitForXPath(`//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]`, { timeout: 10000 }).then(selector => selector.click()) : console.log('nocard ', i);
            await page.waitForTimeout(1000);
        }

        await page.waitForTimeout(5000);
        await page.click('.btn-green')[0]; //start fight
        await page.waitForSelector('#btnRumble', { timeout: 340000 })
        await page.waitForTimeout(5000);
        await page.$eval('#btnRumble', elem => elem.click()); //start rumble
        await page.waitForSelector('#btnSkip', { timeout: 10000 })
        await page.$eval('#btnSkip', elem => elem.click()); //skip rumble
        await page.waitForTimeout(10000);
        await page.click('.btn--done')[0]; //close the fight
    } catch (e) {
        console.log('Error in cards selection!', e);
        throw new Error(e);
    }


}

// 1200000 === 20 MINUTES INTERVAL BETWEEN EACH MATCH
const sleepingTime = 600000;

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    }); // default is true
    const page = await browser.newPage();

    while (true) {
        try {
            const myCards = await getCards(); 
            const quest = await getQuest();
            await startBotPlayMatch(page, myCards, quest)
                .then(() => {
                    console.log('Closing browser', new Date().toLocaleString());        
                })
                .catch((e) => {
                    console.log('Error: ', e)
                })

        } catch (e) {
            console.log('Routine error at: ', new Date().toLocaleString(), e)
        }
        
        await console.log('waiting for the next battle in ', sleepingTime / 1000 / 60, ' minutes')
        await new Promise(r => setTimeout(r, sleepingTime));
    }

    await browser.close();
})();