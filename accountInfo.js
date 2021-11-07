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
