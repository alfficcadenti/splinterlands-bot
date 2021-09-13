const fetch = require("node-fetch");
const user = require('./user');

async function getBronzeLeaderboard() {
    const res = await fetch('https://api2.splinterlands.com/players/leaderboard_with_player?season=69&leaderboard=0')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response;
        })
        .then((leaderboard) => {
            return leaderboard.json();
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    
    return res.leaderboard.map(elem=>elem.player)
}

getBronzeLeaderboard()
    .then(
        async x=> await user.getPlayerCards(x)
            .then(x=>{if(x.ok) {console.log(x); return x.json()} })
            .then(x=>console.log(x))
        );


