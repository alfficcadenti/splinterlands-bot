//my own little bit of code to login and retrieve some useful information form the accoutnx
require('dotenv').config();
const puppeteer = require('puppeteer');
const user = require('./user');
const card = require('./cards');
const { clickOnElement, getElementText, getElementTextByXpath, teamActualSplinterToPlay } = require('./helper');
const quests = require('./quests');
const ask = require('./possibleTeams');
const chalk = require('chalk');
const splinterlandsPage = require('./splinterlandsPage'); 
// console.log('quick little sanity check for the script');
// console.log(`Account: ${process.env.ACCOUNT}`)

async function closePopups(page) {
    console.log('check if any modal needs to be closed...')
	if (await clickOnElement(page, '.close', 4000) ) return;
	await clickOnElement(page, '.modal-close-new', 1000, 2000);
    await clickOnElement(page, '.modal-close', 4000, 2000);
}

async function getStats(page) {
    
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

        try {
            console.log('Getting moneys dec');
            const dec_selector = '#bs-example-navbar-collapse-1 > ul.nav.navbar-nav.navbar-right > li:nth-child(2) > div.dec-container > div.balance';
            const power_selector = '#power_progress > div.progress__info > span.number_text';
            const rank_selector = '#current_league_text';
            const power = await page.$eval(power_selector, (element) => element.textContent);
            const rank = await page.$eval(rank_selector, (element) => element.textContent);
            const amount = await page.$eval(dec_selector, (element) => element.textContent);
            const energy = await getElementTextByXpath(page, "//div[@class='dec-options'][1]/div[@class='value'][2]/div", 100);
            if(amount){
                    console.log(chalk.bold.red('------------------'));
                    console.log(chalk.bold.whiteBright.cyan(`ACCOUNT: ${process.env.ACCOUNT}`));
                    console.log('DEC AMOUNT: ', amount);
                    console.log(chalk.bold.whiteBright.green('Your current Energy Capture Rate is ' + energy.split('.')[0] + "%"));
                    console.log(chalk.bold.whiteBright.green(`RANK:${rank}`));
                    console.log(chalk.bold.whiteBright.green(`POWER: ${power}`));
                    console.log(chalk.bold.red('------------------'));
                } else {
                    console.log(chalk.bold.whiteBright.green('could not find the text div with dec amount'));
                }
            }
        catch (e) {
            console.info('no season reward to be claimed')
        }
    // }


}

//////////////////////////////////////////////////////////////////////////
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

async function letsgo () {
    console.log('START ', process.env.ACCOUNT, new Date().toLocaleString())
    const browser = await puppeteer.launch({
        headless: isHeadlessMode, // default is true
        args: ['--no-sandbox',
        '--disable-setuid-sandbox',
        '--mute-audio',
        '--disable-web-security']
    }); 
    let [page] = await browser.pages();

    await page.setDefaultNavigationTimeout(500000);
    await page.on('dialog', async dialog => {
        await dialog.accept();
    });
    page.goto('https://splinterlands.io/');
    page.recoverStatus = 0;
    // page.favouriteDeck = process.env.FAVOURITE_DECK || '';
    try {
        await getStats(page)
            .then(() => {
                console.log('Closing session', new Date().toLocaleString());        
            })
            .catch((e) => {
                console.log(e)
            })
        await page.waitForTimeout(5000);        
    } catch (e) {
        console.log('Routine error at: ', new Date().toLocaleString(), e)
    }
    // await console.log(process.env.ACCOUNT,'waiting for the next battle in', sleepingTime / 1000 / 60 , ' minutes at ', new Date(Date.now() +sleepingTime).toLocaleString() )
    // await new Promise(r => setTimeout(r, sleepingTime));
    console.log('Process end.')
    await browser.close();
}

letsgo();
