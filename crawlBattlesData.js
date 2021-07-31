'use strict';

const puppeteer = require('puppeteer');

async function login(page) {
    try {
        //await page.click('.navbar-toggle.collapsed'); //FIRST STEP NEEDED IF PAGE SIZE TOO SMALL   
        //await page.waitFor(1000);

        page.waitForSelector('#log_in_button > button').then(() => page.click('#log_in_button > button'))
        await page.waitForSelector('#account')
            .then(() => page.waitForTimeout(1000))
            .then(() => page.focus('#account'))
            .then(() => page.type('#account', process.env.ACCOUNT.split('@')[0], {delay: 100}))
            .then(() => page.focus('#key'))
            .then(() => page.type('#key', process.env.PASSWORD, {delay: 100}))
            .then(() => page.click('#btn_login'))
            .then(() => page.waitForTimeout(2000)
            .then(() => page.waitForSelector('.modal-close-new')))
            .then(() => page.click('.modal-close-new'))
    } catch (e) {
        console.log(e);
    }
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

    await page.goto('https://splinterlands.io/?p=battle_history');
    await page.waitForTimeout(2000);
    await login(page)
    await page.waitForTimeout(2000);
    const [button] = await page.$x("//button[contains(., 'BATTLE LOG')]");
    button ? await button.click() : null;

    var battlesList = await pdocument.querySelectorAll('.history-table > table > tbody > tr');

    battlesList.forEach(x=>console.log(x.querySelector('td:nth-child(8) > img').getAttribute('data-original-title')))
    // var battle = await page.evaluate(() => {
    //     var battlesList = document.querySelectorAll('.history-table > table > tbody > tr');
    //     var battlesArray = [];
    //     for (var i = 0; i < battlesList.length; i++) {
    //         // battlesList[i].querySelector('td:nth-child(9) > img:nth-child(1)').click()
    //         //        .then(()=> {
    //         //         const battleModal = document.querySelector('div#battle_result_content');
    //         //         battlesArray[i] = {
    //         //             mana: battleModal.querySelector('div.mana-cap-value')[0].innerText,
    //         //             rules: battleModal.querySelector('div.ruleset > div.rules').innerText,
    //         //             //splinters: battleModal.querySelector('div.splinters').map().innerText, //todo
    //         //             loser: battleModal.querySelector('div.details-team:not(.winner) > .details-player-name').innerText,
    //         //             winner: battleModal.querySelector('div.details-team.winner > .details-player-name').innerText,
    //         //             //loserTeam: battleModal.querySelector('div.details-team:not(.winner) > div.profile-team-container').innerText,
    //         //             //winnerTeam: battleModal.querySelector('div.details-team:not(.winner) > div.profile-team-container').innerText,
    //         //             link: battleModal.querySelector('div.battle-id > input').getAttribute('value'),
    //         //         }

    //         //     })

    //         battlesArray[i] = {
    //             //mana: battlesList[i].querySelector('td:nth-child(7)').innerText,
    //             rulesSet: battlesList[i].querySelector('td:nth-child(8) > img').getAttribute('data-original-title'),
    //             id: battlesList[i].querySelector('td:nth-child(9) > img:nth-child(3)').getAttribute('data-battle'),
    //         };
    //     }
    //     return battlesArray;
    //   });
      console.log('Battles',battlesList);

    // await page.waitFor(5000).then(
    //     ()=>{
    //         if (Number(mana.manaCap) > 14) {
    //             console.log('14plus')
    //             page.click('#card_162')
    //                 .then(() => page.waitFor(1000))
    //                 .then(() => page.click('#card_196'))
    //                 .then(() => page.click('#card_194'));
    //             mana = checkMana(page).then((mana)=>console.log('mana promise', mana));
    //         } else {
    //             page.click('#card_162')
    //             .then(() => page.waitFor(1000))
    //             .then(() => page.click('#card_196'))
    //             .then(() => page.click('#card_194'));
    //         }
    //     });


    
    
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