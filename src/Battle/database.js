const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'splinterlands',
    password: 'docker',
    port: 5432,
});

client.connect()

const getBattles = () => client.query('select * from battles', (err, res) => {
    console.log(err ? err.stack : res.rows)
    client.end()

    return res;
})
console.log(getBattles());

// const writeBattle = client.query(
//     "INSERT INTO battles (firstname, lastname, age, address, email)VALUES('Mary Ann', 'Wilters', 20, '74 S Westgate St', 'mroyster@royster.com')",'

//     , (err, res) => {
//     console.log(err ? err.stack : res.rowCount) // Hello World!
//     client.end()
// })