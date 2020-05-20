//'use strict';
require('dotenv').config()
var cron = require('node-cron');
const ask = require('./askFormation');
const puppeteer = require('puppeteer');


async function login(page) {
    try {
        //await page.click('.navbar-toggle.collapsed'); //FIRST STEP NEEDED IF PAGE SIZE TOO SMALL   
        //await page.waitFor(1000);

        page.waitForSelector('#log_in_button > button').then(() => page.click('#log_in_button > button'))
        await page.waitForSelector('#account')
            .then(() => page.waitFor(3000))
            .then(() => page.focus('#account'))
            .then(() => page.type('#account', process.env.ACCOUNT))
            //.then(() => page.type('#account', 'a1492dc@gmail.com'))
            .then(() => page.focus('#key'))
            .then(() => page.type('#key', process.env.PASSWORD))
            //.then(() => page.type('#key', 'Ro22adqq!'))
            .then(() => page.click('#btn_login'))
            .then(() => page.waitFor(5000)
                .then(() => page.waitForSelector('.modal-close-new'))
                .then(() => page.click('.modal-close-new'))
            )

    } catch (e) {
        console.log('login error', e);
    }
}

async function makeTeam(page) {

}

async function checkMana(page) {
    var manas = await page.evaluate(() => {
        var manaCap = document.querySelectorAll('div.mana-total > span.mana-cap')[0].innerText;
        var manaUsed = document.querySelectorAll('div.mana-total > span.mana-used')[0].innerText;
        var manaLeft = manaCap - manaUsed
        return { manaCap, manaUsed, manaLeft };
    });
    console.log('manaLimit', manas);
    return manas;
}

async function checkMatchMana(page) {
    const manaCap = await page.evaluate(() => document.querySelectorAll('div.mana-cap-value')[0].innerText);
    return manaCap;
}

async function checkMatchRules(page) {
    const rules = await page.evaluate(() => {
        let matchRules = []
        const rules = document.querySelectorAll('div.current-rules > b');
        [...rules].forEach((rule) => {
            matchRules = [...matchRules, rule.innerText]
        });
        console.log('OBJ', matchRules)
        return matchRules.join('|');
    });
    return rules;
}

async function checkMatchActiveSplinters(page) {
    const splinters = await page.evaluate(() => {
        let splintersArray = []
        const splinters = document.querySelectorAll('div.splinter-grid > .splinter > img');
        [...splinters].forEach((splinter) => {
            console.log(splinter)
            splintersArray = [...splintersArray, splinter.data - original - title]
        });
        return splintersArray
    });
    return splinters;
}

const makeCardId = (id) => '#card_' + id;


async function openSplinter() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1,
    });

    await page.goto('https://splinterlands.io/');
    await page.waitFor(4000);
    await login(page);
    await page.waitFor(6000);
    // LAUNCH the battle
    const [button] = await page.$x("//button[contains(., 'RANKED')]");
    button ? await button.click() : null;
    await page.waitFor(30000);

    const [button2] = await page.$x("//button[contains(., 'MAKE TEAM')]");
    button2 ? await button2.click() : null;
    await page.waitFor(5000);

    await page.waitForSelector('.btn--create-team', { timeout: 90000 })
        //then read rules   

        .then(async () => {
            let [rules, mana, splinters] = await Promise.all([
                checkMatchRules(page).then((rulesArray) => rulesArray).catch(() => 'no rules'),
                checkMatchMana(page).then((mana) => mana).catch(() => 'no mana'),
                checkMatchActiveSplinters(page).then((splinters) => splinters).catch(() => 'no splinters')
            ]);

            //page.click('#btn_make_team')
            return { rules: rules, mana: mana, splinters: splinters }
        })
        .then((matchDetails) => ask.askFormation(matchDetails))
        .then((possibleTeams) => {
            if (possibleTeams) {
                page.click('#btn_make_team');
                return possibleTeams
            }
            page.click('.btn-red')[0]
        })
        .then((possibleTeams) => { console.log('possible teams: ', possibleTeams, possibleTeams.length); if (possibleTeams.length !== 0) { return possibleTeams } else { console.log('NO TEAMS') }; })
        .then((possibleTeams) => {
            let i = 0;
            while (i < possibleTeams.length) {
                if (possibleTeams[i][0] !== 224) {
                    const summoner = makeCardId(possibleTeams[i][0].toString()); console.log('summoner: ', summoner); return { summoner, possibleTeams }
                }
                i++;
            }
        }) //select 
        .then(input => {
            page.waitForSelector(input.summoner)
                .then(() => page.click(input.summoner)
                    .then(() => {
                        page.waitForSelector(makeCardId(input.possibleTeams[0][1].toString()))
                            .then(() => page.click(makeCardId(input.possibleTeams[0][1].toString())))
                            .then(() => input.possibleTeams[0][2] ? page.click(makeCardId(input.possibleTeams[0][2].toString())) : console.log('nocard 2'))
                            .then(() => input.possibleTeams[0][3] ? page.click(makeCardId(input.possibleTeams[0][3].toString())) : console.log('nocard 3'))
                            .then(() => input.possibleTeams[0][4] ? page.click(makeCardId(input.possibleTeams[0][4].toString())) : console.log('nocard 4'))
                            .then(() => input.possibleTeams[0][5] ? page.click(makeCardId(input.possibleTeams[0][5].toString())) : console.log('nocard 5'))
                            .then(() => input.possibleTeams[0][6] ? page.click(makeCardId(input.possibleTeams[0][6].toString())) : console.log('nocard 6'))
                        console.log('team:', input)
                    })
                    .catch(e => console.log('ERROR: ', e))
                ); return input
        })
        // .then(() => page.waitForSelector('#card_162') //select 
        // .then(() => page.click('#card_162')))
        .then(() => page.waitFor(5000))
        .then(() => page.click('.btn-green')[0]) //start fight
        // .then(() => page.waitFor(30000))
        // .then(() => page.click('#btnRumble'))
        // .then(() => page.waitFor(30000))
        // .then(() => page.click('#btnSkip'))
        // .then(() => page.waitFor(5000))
        .then(() => page.waitFor(5000))
        .then(() => browser.close())

}

cron.schedule('*/3 * * * *', () => {
    try {
        openSplinter();
    }
    catch (e) {
        console.log('Error: ', e);
    }
});

