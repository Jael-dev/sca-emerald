const express = require('express')
const sql = require('mssql')

const app = express()
var poolConnection;

//? Connection Configuration

const config = {
    user: 'jael',
    password: 'teKriture.me',
    server: 'tekriture.database.windows.net',
    port: 1433,
    database: 'tekriture',
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}

//? Connection Function

async function connect() {
    try {
        poolConnection = await sql.connect(config);
        console.log("Connection established")
    } catch (e) {
        console.log(e.message)
    }
}


connect()


async function closeConnection() {
    try {
        poolConnection.close();
        console.log("Connection closed")
    } catch (e) {
        console.log(e.message)
    }
}


//? Articles Queries

//! Get articles


// Get all articles
app.get('/articles', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM Articles`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.add(row)
        });

        res.send(result)

    } catch (e) {
        console.log(e.message)
    }
})

// Get articles by id
app.get('/articles/:id', async (req, res) => {
    const id = req.params.id

    try {
        let data = await poolConnection.request().query(`SELECT * FROM Articles WHERE ArticleId = $id`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }

})

// TODO: Get articles by tages and by dates

//? Post articles

app.post('/article', async (req, res) => {

    try {
        let data = await poolConnection.request().query(`INSERT INTO  Articles  $req`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }
})


//? Books Queries

//! Get books


// Get all books
app.get('/books', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM Books`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.add(row)
        });

        res.send(result)

    } catch (e) {
        console.log(e.message)
    }
})

// Get books by id
app.get('/books/:id', async (req, res) => {
    const id = req.params.id

    try {
        let data = await poolConnection.request().query(`SELECT * FROM books WHERE BookId = $id`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }

})

// TODO: Get books by tags and by dates

//? Post books

app.post('/books', async (req, res) => {

    try {
        let data = await poolConnection.request().query(`INSERT INTO  Books  $req`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }
})


//? books Queries

//! Get articles


// Get all articles
app.get('/articles', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM Articles`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.add(row)
        });

        res.send(result)

    } catch (e) {
        console.log(e.message)
    }
})

// Get articles by id
app.get('/articles/:id', async (req, res) => {
    const id = req.params.id

    try {
        let data = await poolConnection.request().query(`SELECT * FROM Articles WHERE ArticleId = $id`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }

})

//? Post articles

app.post('/aricle', async (req, res) => {

    try {
        let data = await poolConnection.request().query(`INSERT INTO  Articles  $req`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }
})


//? Articles Queries

//! Get articles


// Get all articles
app.get('/articles', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM Articles`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.add(row)
        });

        res.send(result)

    } catch (e) {
        console.log(e.message)
    }
})

// Get articles by id
app.get('/articles/:id', async (req, res) => {
    const id = req.params.id

    try {
        let data = await poolConnection.request().query(`SELECT * FROM Articles WHERE ArticleId = $id`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }

})

//? Post articles

app.post('/aricle', async (req, res) => {

    try {
        let data = await poolConnection.request().query(`INSERT INTO  Articles  $req`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }
})


//? Articles Queries

//! Get articles


// Get all articles
app.get('/articles', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM Articles`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.add(row)
        });

        res.send(result)

    } catch (e) {
        console.log(e.message)
    }
})

// Get articles by id
app.get('/articles/:id', async (req, res) => {
    const id = req.params.id

    try {
        let data = await poolConnection.request().query(`SELECT * FROM Articles WHERE ArticleId = $id`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }

})

//? Post articles

app.post('/aricle', async (req, res) => {

    try {
        let data = await poolConnection.request().query(`INSERT INTO  Articles  $req`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }
})


