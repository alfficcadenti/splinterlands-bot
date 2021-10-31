//'use strict';
require('dotenv').config()
const puppeteer = require('puppeteer');

const splinterlandsPage = require('./splinterlandsPage');
const user = require('./user');
const card = require('./cards');
const { clickOnElement, getElementText, getElementTextByXpath, teamActualSplinterToPlay } = require('./helper');
const quests = require('./quests');
const ask = require('./possibleTeams');
const chalk = require('chalk');

let totalDec = 0;
let winTotal = 0;
let loseTotal = 0;
let undefinedTotal = 0;

// LOAD MY CARDS
async function getCards() {
    const myCards = await user.getPlayerCards(process.env.ACCOUNT.split('@')[0]) //split to prevent email use
    return myCards;
} 

async function getQuest() {
    return quests.getPlayerQuest(process.env.ACCOUNT.split('@')[0])
        .then(x=>x)
        .catch(e=>console.log('No quest data, splinterlands API didnt respond, or you are wrongly using the email and password instead of username and posting key'))
}

async function closePopups(page) {
    console.log('check if any modal needs to be closed...')
	if (await clickOnElement(page, '.close', 4000) ) return;
	await clickOnElement(page, '.modal-close-new', 1000, 2000);
    await clickOnElement(page, '.modal-close', 4000, 2000);
}

async function checkEcr(page) {
    try {
        const ecr = await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 100);
        if(ecr) {
            console.log(chalk.bold.whiteBright.bgMagenta('Your current Energy Capture Rate is ' + ecr.split('.')[0] + "%"));
            return parseFloat(ecr)
        }
    } catch (e) {
        console.log(chalk.bold.redBright.bgBlack('ECR not defined'));
    }
}

async function startBotPlayMatch(page) {
    
    console.log( new Date().toLocaleString(), 'opening browser...')
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3163.100 Safari/537.36');
    await page.setViewport({
        width: 1800,
        height: 1500,
        deviceScaleFactor: 1,
    });

    await page.goto('https://splinterlands.io/');
    await page.waitForTimeout(8000);

    let item = await page.waitForSelector('#log_in_button > button', {
        visible: true,
      })
      .then(res => res)
      .catch(()=> console.log('Already logged in'))

    if (item != undefined)
    {console.log('Login attempt...')
        await splinterlandsPage.login(page).catch(e=>{
            console.log(e);
            throw new Error('Login Error');
        });
    }
    
    await page.goto('https://splinterlands.io/?p=battle_history');
    await page.waitForTimeout(8000);
    await closePopups(page);
    await closePopups(page);


    const ecr = await checkEcr(page);
    if(page.recoverStatus === 0) {
        if (process.env.ECR_STOP_LIMIT && ecr < parseFloat(process.env.ECR_STOP_LIMIT)) {
            page.recoverStatus = 1
            console.log(chalk.bold.red(`ECR lower than limit ${process.env.ECR_STOP_LIMIT}%. reduce the limit in the env file config or wait until ECR will be at ${process.env.ECR_RECOVER_TO || '100'}%`));
            throw new Error(`ECR lower than limit ${process.env.ECR_STOP_LIMIT}`);
        }
    } else {
        if (process.env.ECR_STOP_LIMIT && process.env.ECR_RECOVER_TO && (ecr >= parseFloat(process.env.ECR_RECOVER_TO || ecr === 100))) {
            page.recoverStatus = 0;
            console.log(chalk.bold.red('ECR Recovered'));
        } else {
            console.log(chalk.bold.red(`ECR Not yet Recovered to ${process.env.ECR_RECOVER_TO}`));
            throw new Error(`Recovery phase and ECR lower than limit ${process.env.ECR_RECOVER_TO}`);
        }
    }
    

    console.log('getting user quest info from splinterlands API...')
    const quest = await getQuest();
    if(!quest) {
        console.log('Error for quest details. Splinterlands API didnt work or you used incorrect username, remove @ and dont use email')
    }

    console.log('getting user cards collection from splinterlands API...')
    const myCards = await getCards()
        .then((x)=>{console.log('cards retrieved'); return x})
        .catch(()=>console.log('cards collection api didnt respond. Did you use username? avoid email!')); 

    if(myCards) {
        console.log(process.env.ACCOUNT, ' deck size: '+myCards.length)
    } else {
        console.log(process.env.ACCOUNT, ' playing only basic cards')
    }

    //check if season reward is available
    if (process.env.CLAIM_SEASON_REWARD === 'true') {
        try {
            console.log('Season reward check: ');
            await page.waitForSelector('#claim-btn', { visible:true, timeout: 3000 })
            .then(async (button) => {
                button.click();
                console.log(`claiming the season reward. you can check them here https://peakmonsters.com/@${process.env.ACCOUNT}/explorer`);
                await page.waitForTimeout(20000);
                await page.reload();

            })
            .catch(()=>console.log(`no season reward to be claimed, but you can still check your data here https://peakmonsters.com/@${process.env.ACCOUNT}/explorer`));
            await page.waitForTimeout(3000);
            await page.reload();
        }
        catch (e) {
            console.info('no season reward to be claimed')
        }
    }

    //if quest done claim reward. default to true. to deactivate daily quest rewards claim, set CLAIM_DAILY_QUEST_REWARD false in the env file
    console.log('claim daily quest setting:', process.env.CLAIM_DAILY_QUEST_REWARD, 'Quest details: ', quest);
    const isClaimDailyQuestMode = process.env.CLAIM_DAILY_QUEST_REWARD === 'false' ? false : true; 
    if (isClaimDailyQuestMode === true) {
        try {
            await page.waitForSelector('#quest_claim_btn', { timeout: 5000 })
                .then(button => button.click());
        } catch (e) {
            console.info('no quest reward to be claimed waiting for the battle...')
        }
    }




    await page.waitForTimeout(5000);

    // LAUNCH the battle
    try {
        console.log('waiting for battle button...')
        await page.waitForXPath("//button[contains(., 'BATTLE')]", { timeout: 20000 })
            .then(button => {console.log('Battle button clicked'); button.click()})
            .catch(e=>console.error('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'));
        await page.waitForTimeout(5000);

        console.log('waiting for an opponent...')
        await page.waitForSelector('.btn--create-team', { timeout: 50000 })
            .then(()=>console.log('start the match'))
            .catch(async (e)=> {
            console.error('[Error while waiting for battle]');
            console.error('Refreshing the page and retrying to retrieve a battle');
            await page.waitForTimeout(5000);
            await page.reload();
            await page.waitForTimeout(5000);
            await page.waitForXPath("//button[contains(., 'BATTLE')]", { timeout: 20000 })
            .then(button => {console.log('Battle button clicked'); button.click()})
            .catch(e=>console.error('[ERROR] waiting for Battle button. is Splinterlands in maintenance?'));
            await page.waitForSelector('.btn--create-team', { timeout: 50000 })
                .then(()=>console.log('start the match'))
                .catch(async ()=>{
                    console.log('second attempt failed reloading from homepage...');
                    await page.goto('https://splinterlands.io/');
                    await page.waitForTimeout(5000);
                    await page.waitForXPath("//button[contains(., 'BATTLE')]", { timeout: 20000 })
                        .then(button => button.click())
                        .catch(e=>console.error('[ERROR] waiting for Battle button second time'));
                    await page.waitForTimeout(5000);
                    await page.waitForSelector('.btn--create-team', { timeout: 50000 })
                        .then(()=>console.log('start the match'))
                        .catch((e)=>{
                            console.log('third attempt failed');
                            throw new Error(e);})
                        })
        })
    } catch(e) {
        console.error('[Battle cannot start]:', e)
        throw new Error('The Battle cannot start');

    }
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
        console.log('Possible Teams based on your cards: ', possibleTeams.length);
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
        await page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, { timeout: 10000 })
            .then(summonerButton => summonerButton.click())
            .catch(async ()=>{
                console.log(teamToPlay.summoner,'divId not found, reload and try again')
                page.reload();
                await page.waitForTimeout(2000);
                page.waitForXPath(`//div[@card_detail_id="${teamToPlay.summoner}"]`, { timeout: 10000 }).then(summonerButton => summonerButton.click())
            });
        if (card.color(teamToPlay.cards[0]) === 'Gold') {
            console.log('Dragon play TEAMCOLOR', teamActualSplinterToPlay(teamToPlay.cards.slice(0, 6)))
            await page.waitForXPath(`//div[@data-original-title="${teamActualSplinterToPlay(teamToPlay.cards.slice(0, 6))}"]`, { timeout: 8000 })
                .then(selector => selector.click())
        }
        await page.waitForTimeout(5000);
        for (i = 1; i <= 6; i++) {
            console.log('play: ', teamToPlay.cards[i].toString())
            await teamToPlay.cards[i] ? page.waitForXPath(`//div[@card_detail_id="${teamToPlay.cards[i].toString()}"]`, { timeout: 10000 })
                .then(selector => selector.click()) : console.log('nocard ', i);
            await page.waitForTimeout(1000);
        }

        await page.waitForTimeout(5000);
        try {
            await page.click('.btn-green')[0]; //start fight
        } catch {
            console.log('Start Fight didnt work, waiting 5 sec and retry');
            await page.waitForTimeout(5000);
            await page.click('.btn-green')[0]; //start fight
        }
        await page.waitForTimeout(5000);
        await page.waitForSelector('#btnRumble', { timeout: 90000 }).then(()=>console.log('btnRumble visible')).catch(()=>console.log('btnRumble not visible'));
        await page.waitForTimeout(5000);
        await page.$eval('#btnRumble', elem => elem.click()).then(()=>console.log('btnRumble clicked')).catch(()=>console.log('btnRumble didnt click')); //start rumble
        await page.waitForSelector('#btnSkip', { timeout: 10000 }).then(()=>console.log('btnSkip visible')).catch(()=>console.log('btnSkip not visible'));
        await page.$eval('#btnSkip', elem => elem.click()).then(()=>console.log('btnSkip clicked')).catch(()=>console.log('btnSkip not visible')); //skip rumble
        await page.waitForTimeout(5000);
        try {
			const winner = await getElementText(page, 'section.player.winner .bio__name__display', 15000);
			if (winner.trim() == process.env.ACCOUNT.split('@')[0]) {
				const decWon = await getElementText(page, '.player.winner span.dec-reward span', 1000);
				console.log(chalk.green('You won! Reward: ' + decWon + ' DEC'));
                totalDec += !isNaN(parseFloat(decWon)) ? parseFloat(decWon) : 0 ;
                winTotal += 1;
			}
			else {
                console.log(chalk.red('You lost'));
                loseTotal += 1;
			}
		} catch {
			console.log('Could not find winner - draw?');
            undefinedTotal += 1;
		}
		await clickOnElement(page, '.btn--done', 20000, 10000);
		await clickOnElement(page, '#menu_item_battle', 20000, 10000);

        console.log('Total Battles: ' + (winTotal + loseTotal + undefinedTotal) + chalk.green(' - Win Total: ' + winTotal) + chalk.yellow(' - Draw? Total: ' + undefinedTotal) + chalk.red(' - Lost Total: ' + loseTotal));
        console.log(chalk.green('Total Earned: ' + totalDec + ' DEC'));
        
    } catch (e) {
        throw new Error(e);
    }


}

// 30 MINUTES INTERVAL BETWEEN EACH MATCH (if not specified in the .env file)
const sleepingTimeInMinutes = process.env.MINUTES_BATTLES_INTERVAL || 30;
const sleepingTime = sleepingTimeInMinutes * 60000;
const isHeadlessMode = process.env.HEADLESS === 'false' ? false : true; 


const blockedResources = [
    'splinterlands.com/players/item_details',
    'splinterlands.com/players/event',
    'splinterlands.com/market/for_sale_grouped',
    'splinterlands.com/battle/history2',
    'splinterlands.com/players/messages',
    'facebook.com',
    'google-analytics.com',
    'twitter.com',
];


(async () => {
    console.log('START ', process.env.ACCOUNT, new Date().toLocaleString())
    const browser = await puppeteer.launch({
        headless: isHeadlessMode, // default is true
        args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        //'--disable-dev-shm-usage',
        // '--disable-accelerated-2d-canvas',
        // '--disable-canvas-aa', 
        // '--disable-2d-canvas-clip-aa', 
        // '--disable-gl-drawing-for-tests', 
        // '--no-first-run',
        // '--no-zygote', 
        // '--disable-dev-shm-usage', 
        // '--use-gl=swiftshader', 
        // '--single-process', // <- this one doesn't works in Windows
        // '--disable-gpu',
        // '--enable-webgl',
        // '--hide-scrollbars',
        '--mute-audio',
        // '--disable-infobars',
        // '--disable-breakpad',
        '--disable-web-security']
    }); 
    //const page = await browser.newPage();
    let [page] = await browser.pages();

    // NOT WORKING on ALL the machines
    // await page.setRequestInterception(true);
    // page.on('request', (interceptedRequest) => {
    //     //    console.log("URL: " + interceptedRequest.url())
    //     //            page.on('request', (request) => {
    //         // BLOCK CERTAIN DOMAINS
    //         if (blockedResources.some(resource => interceptedRequest.url().includes(resource))){
    //     //        console.log("Blocked: " + interceptedRequest.url());
    //             interceptedRequest.abort();
    //         // ALLOW OTHER REQUESTS
    //         } else {
    //             interceptedRequest.continue();
    //     }
    //       });
    await page.setDefaultNavigationTimeout(500000);
    await page.on('dialog', async dialog => {
        await dialog.accept();
    });
    page.goto('https://splinterlands.io/');
    page.recoverStatus = 0;
    while (true) {
        console.log('Recover Status: ', page.recoverStatus)
        console.log(chalk.bold.redBright.bgBlack('Dont pay scammers!'));
        console.log(chalk.bold.whiteBright.bgBlack('If you need support for the bot, join the telegram group https://t.me/splinterlandsbot and discord https://discord.gg/bR6cZDsFSX'));
        console.log(chalk.bold.greenBright.bgBlack('If you interested in a higher winning rate with the private API, contact the owner via discord or telegram')); 
        try {
            await startBotPlayMatch(page)
                .then(() => {
                    console.log('Closing battle', new Date().toLocaleString());        
                })
                .catch((e) => {
                    console.log(e)
                })
            await page.waitForTimeout(5000);
            
        } catch (e) {
            console.log('Routine error at: ', new Date().toLocaleString(), e)
        }
        await console.log(process.env.ACCOUNT,'waiting for the next battle in', sleepingTime / 1000 / 60 , ' minutes at ', new Date(Date.now() +sleepingTime).toLocaleString() )
        await new Promise(r => setTimeout(r, sleepingTime));
    }
    console.log('Process end. need to restart')
    await browser.close();
})();