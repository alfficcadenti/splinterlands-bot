
const cardsDetails = require("./data/cardsDetails.json");
const card = require("./cards")

// const teamIdsArray = [167, 192, 160, 161, 163, 196, '', 'fire'];

//cardColor = (id) => cardsDetails.find(o => o.id === id) ? cardsDetails.find(o => o.id === id).color : '';

const validDecks = ['Red', 'Blue', 'White', 'Black', 'Green']
const colorToDeck = { 'Red': 'Fire', 'Blue': 'Water', 'White': 'Life', 'Black': 'Death', 'Green': 'Earth' }

// const tes = teamIdsArray.forEach(id => {
//     console.log('DEBUG', id, cardColor(id))
//     if (validDecks.includes(cardColor(id))) {
//         return colorToDeck[cardColor(id)];
//     }
// })

const deckValidColor = (accumulator, currentValue) => validDecks.includes(card.color(currentValue)) ? colorToDeck[card.color(currentValue)] : accumulator;

const reload = async (page) => { console.log('reloading page...') ; await page.reload(); }

const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

const teamActualSplinterToPlay = (teamIdsArray) => teamIdsArray.reduce(deckValidColor, '')

const clickOnElement = async (page, selector, timeout=20000, delayBeforeClicking = 0) => {
	try {
        const elem = await page.waitForSelector(selector, {timeout: timeout });
		if(elem) {
			await sleep(delayBeforeClicking);
			console.log('Clicking element', selector);
			await elem.click();
			return true;
		}
    } catch (e) {
    }
	console.log('No element', selector, 'to be closed');
	return false;
}

const getElementText = async (page, selector, timeout=15000) => {
	const element = await page.waitForSelector(selector, {timeout: timeout });
	const text = await element.evaluate(el => el.textContent);
	return text;
}

const getElementTextByXpath = async (page, selector, timeout=20000) => {
	try {
		const element = await page.waitForXPath(selector,  { timeout: timeout });
		const text = await element.evaluate(el => el.textContent);
		return text;
	} catch (e) {
		console.log('Get text by xpath error.', e);
		return false
	}
}

module.exports.teamActualSplinterToPlay = teamActualSplinterToPlay;
module.exports.clickOnElement = clickOnElement;
module.exports.getElementText = getElementText;
module.exports.getElementTextByXpath = getElementTextByXpath;
module.exports.sleep = sleep;
module.exports.reload = reload;