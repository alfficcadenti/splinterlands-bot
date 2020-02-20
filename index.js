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
            .then(() => page.type('#account', '@gmail.com', {delay: 100}))
            .then(() => page.focus('#key'))
            .then(() => page.type('#key', '', {delay: 100}))
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
    var manas = await page.evaluate(() => {
        var manaCap = document.querySelectorAll('div.mana-total > span.mana-cap')[0].innerText;
        var manaUsed = document.querySelectorAll('div.mana-total > span.mana-used')[0].innerText;
        var manaLeft = manaCap - manaUsed
        return {manaCap, manaUsed, manaLeft};
      });
    console.log('manaLimit',manas);
    return manas;
}


async function openSplinter() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({
        width: 1500,
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
        .then(() => page.waitForSelector('#card_167') //select 
        .then(() => page.click('#card_167')))

    await page.waitFor(1000);

    //Make the team
    await page.waitFor(1000);

    let mana = checkMana(page).then((mana)=>console.log('mana promise', mana));
   
    let listLength = await page.evaluate((sel) => {
            return document.getElementsByClassName(sel).length;
        }, 'stat-text-mana');

    console.log('cardsListLength',listLength);


    var cards = await page.evaluate(() => {
        var manaList = document.querySelectorAll('div.deck-builder-page2__cards > div.card');
        var cardsArray = [];
        for (var i = 0; i < manaList.length; i++) {
            cardsArray[i] = {
                name: manaList[i].querySelectorAll('.card-name-name')[0].innerText,
                level: manaList[i].querySelectorAll('.card-name-level')[0].innerText,
                mana: manaList[i].querySelectorAll('.stat-text-mana')[0].innerText,
                cardId: manaList[i].id,
                // attack: manaList[i].querySelectorAll('.stat-attack')[0].innerText,
                // speed: manaList[i].querySelectorAll('.stat-speed')[0].innerText,
                // health: manaList[i].querySelectorAll('.stat-health')[0].innerText,
            };
        }
        return cardsArray;
      });
      console.log('cards',cards);

    mana = checkMana(page).then((mana)=>console.log('mana promise', mana));
    await page.waitFor(5000).then(
        ()=>{
            if (Number(mana.manaCap) > 14) {
                console.log('14plus')
                page.click('#card_162')
                    .then(() => page.waitFor(1000))
                    .then(() => page.click('#card_196'))
                    .then(() => page.click('#card_194'));
                mana = checkMana(page).then((mana)=>console.log('mana promise', mana));
            } else {
                page.click('#card_162')
                .then(() => page.waitFor(1000))
                .then(() => page.click('#card_196'))
                .then(() => page.click('#card_194'));
            }
        });


    
    
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