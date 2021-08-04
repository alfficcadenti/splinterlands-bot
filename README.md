# splinterlands-bot

This is my personal project of a BOT to play the game [Splinterlands](https://www.splinterlands.com)
I've created using my personal free time. If you like it or benefit from it and would like to offer me a beer, send me some DEC into the game to the player **splinterlava** or send me some Ethereum @ 0x8FA3414DC2a2F886e303421D07bda5Ef45C84A3b cheers!

## index.js

run `npm start`

to start BOT login routine. username and password needs to be specified in the file .env (file with no name, only starting dot to create a hidden file) in the root as variable like:

- `ACCOUNT=youremail@email.com`
- `PASSWORD=yourpassword`

## battleGetData.js

run `node battleGetData.js`

The BOT leverage an API but in case doesn't work, it is possible to have locally an history as a backup.
To generate the file 'history.json' with a unique array with the history of the battles of an array of users (to be specified in the file).

input data for future model:

- _mana_cap_: the total mana that can be selected
- _ruleset_: rules applied for the match (to be explored)
- _inactive_: type of monster card that are not available for the match. important for the summoner selection (first card)

_Example_: `[{"summoner_id":178, "summoner_level":1, "monster_1_id":174, "monster_1_level":1, "monster_1_abilities":[ ], "monster_2_id":172, "monster_2_level":1, "monster_2_abilities":[ ], "monster_3_id":169, "monster_3_level":1, "monster_3_abilities":[ ], "monster_4_id":"", "monster_4_level":"" "monster_4_abilities":"", "monster_5_id":"", "monster_5_level":"", "monster_5_abilities":"", "monster_6_id":"", "monster_6_level":"", "monster_6_abilities":"", "created_date":"2020-02-21T00:51:30.717Z", "match_type":"Ranked", "mana_cap":13, "ruleset":"Back to Basics", "inactive":"Green,Black,Gold", "battle_queue_id":"a137a7b662bdb182069a8a13f36071ed14a4a6d9", "player_rating_initial":596, "player_rating_final":617, "winner":"a14"],...}`

## battleGet.js

run `node battleGet.js`

to generate the file 'playerName.json' with the history of the battles and print the list of distinct players.

input data for future model:

- _mana_cap_: the total mana that can be selected
- _ruleset_: rules applied for the match (to be explored)
- _inactive_: type of monster card that are not available for the match. important for the summoner selection (first card)
- _details_team(1 and 2)_:

  - _summoner_: main card to be selected. important info for the model are _"card_detail_id"_ and _"level"_.
    _Example:`"summoner":{ "uid":"starter-167-2UoZi", "xp":1, "gold":false, "card_detail_id":167, "level":1, "edition":4, "state":{ }`_

  - _monsters_: array of team cards. Important variables for the models are _"card_detail_id"_, _"abilites"_ (array), and _"level"_.
    _Example:`"monsters":[ { "uid":"starter-162-bZwj2", "xp":1, "gold":false, "card_detail_id":162, "level":1, "edition":4, "state":{ }, "abilities":[ "Shield" ] }, { "uid":"starter-160-zCoGb", "xp":1, "gold":false, "card_detail_id":160, "level":1, "edition":4, "state":{ }, "abilities":[ ] } ]`_

### Edge cases:

- when a player fled the battle: the match is not recorded
