'use strict';

const puppeteer = require('puppeteer');

async function login(page) {
    try {
        //await page.click('.navbar-toggle.collapsed'); //FIRST STEP NEEDED IF PAGE SIZE TOO SMALL   
        //await page.waitFor(1000);

        page.waitForSelector('#log_in_button > button').then(() => page.click('#log_in_button > button'))
        await page.waitForSelector('#account')
            .then(() => page.waitFor(1000))
            .then(() => page.focus('#account'))
            .then(() => page.type('#account', 'a1492dc@gmail.com', {delay: 100}))
            .then(() => page.focus('#key'))
            .then(() => page.type('#key', 'biomassa', {delay: 100}))
            .then(() => page.click('#btn_login'))
            .then(() => page.waitFor(2000)
            .then(() => page.waitForSelector('.modal-close-new')))
            .then(() => page.click('.modal-close-new'))
    } catch (e) {
        console.log(e);
    }
}

async function makeTeam(page) {
    
}

async function checkMana(page) {
    var manaLimit = await page.evaluate(() => {
        var manaCap = document.querySelectorAll('div.mana-total > span.mana-cap')[0].innerText;
        var manaUsed = document.querySelectorAll('div.mana-total > span.mana-used')[0].innerText;
        return [manaCap,manaUsed];
      });
    console.log('manaLimit',manaLimit);
    return manaLimit;
}


async function openSplinter() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({
        width: 1000,
        height: 800,
        deviceScaleFactor: 1,
      });

    await page.goto('https://splinterlands.io/');
    await page.waitFor(2000);
    await login(page)
    await page.waitFor(2000);
    // LAUNCH the battle
    const [button] = await page.$x("//button[contains(., 'RANKED')]");
    button ? await button.click() : null;
    await page.waitFor(5000);

    await page.waitForSelector('#btn_make_team')
        .then(() => page.waitFor(1000))
        .then(() => page.click('#btn_make_team'))
        .then(() => page.waitForSelector('#card_167')
        .then(() => page.click('#card_167')))

    await page.waitFor(1000);

    //Make the team
    await page.waitFor(1000);

    let mana = checkMana(page).then((mana)=>console.log('mana promise', mana));
   
    const LENGTH_SELECTOR_CLASS = 'stat-text-mana';

    let listLength = await page.evaluate((sel) => {
            return document.getElementsByClassName(sel).length;
        }, LENGTH_SELECTOR_CLASS);

    console.log('cardsList',listLength);


    var cards = await page.evaluate(() => {
        var manaList = document.querySelectorAll('div.deck-builder-page2__cards > div.card');
        var cardsArray = [];
        for (var i = 0; i < manaList.length; i++) {
            cardsArray[i] = {
                name: manaList[i].querySelectorAll('.card-name-name')[0].innerText,
                level: manaList[i].querySelectorAll('.card-name-level')[0].innerText,
                mana: manaList[i].querySelectorAll('.stat-text-mana')[0].innerText,
                // attack: manaList[i].querySelectorAll('.stat-attack')[0].innerText,
                // speed: manaList[i].querySelectorAll('.stat-speed')[0].innerText,
                // health: manaList[i].querySelectorAll('.stat-health')[0].innerText,
            };
        }
        return cardsArray;
      });
      console.log('cards',cards);



    // const getManaCap = await page.$$('div.mana-total > span.mana-cap')
    // const getManaUsed = await page.$$('div.mana-total > span.mana-used')

    // // const manaCap = await page.evaluate(()=>document.querySelectorAll('span.mana-cap'));
    // // const manaUsed = await page.evaluate(()=>document.querySelectorAll('span.mana-used'));
    // console.log('MANA STATS:',getManaCap.innerHTML,getManaUsed.innerHTML);
    // await page.waitFor(10000);
    // const text = await page.evaluate(()=>{
    //     const manas = document.querySelectorAll('div.stat-text-mana')
    //     console.log('MANAS', manas);
    //     return manas;
    // });
    // console.log(text)


    
    //deck-builder-page2__cards
    // card id card_167
    
    // battle_container
    // btn-green

    // id btnRumble

    //exit battle
    //button.btn-battle

  
    //await page.waitForSelector('.algolia__results');
  
    //await browser.close();
  }
  
  openSplinter();