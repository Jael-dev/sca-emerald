const express = require('express')
const sql = require('mssql')
const bodyParser = require('body-parser');
const cors = require('cors');
const metadata = require('gcp-metadata');
const {OAuth2Client} = require('google-auth-library');
const AWS = require('aws-sdk');

const app = express()
const oAuth2Client = new OAuth2Client();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb', parameterLimit: 100000, }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));


//! Auth functions


let aud;

async function audience() {
  if (!aud && (await metadata.isAvailable())) {
    let project_number = await metadata.project('numeric-project-id');
    let project_id = await metadata.project('project-id');

    aud = '/projects/' + project_number + '/apps/' + project_id;
  }

  return aud;
}

async function validateAssertion(assertion) {
    if (!assertion) {
      return {};
    }
  
    // Check that the assertion's audience matches ours
    const aud = await audience();
  
    // Fetch the current certificates and verify the signature on the assertion
    const response = await oAuth2Client.getIapPublicKeys();
    const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
      assertion,
      response.pubkeys,
      aud,
      ['https://cloud.google.com/iap']
    );
    const payload = ticket.getPayload();
  
    // Return the two relevant pieces of information
    return {
      email: payload.email,
      sub: payload.sub,
    };
  }

//? Connection Configuration To AWS
const s3 = new AWS.S3({
    accessKeyId: "AKIAZKAF4JEXSPN2HAIZ",
    secretAccessKey: "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",
});

const BUCKET = 'tekriture';
var poolConnection;
const port = 8001;


//? Connection Configuration TO Azure DB

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

//? Connection Function to DB

async function connect() {
    try {
        poolConnection = await sql.connect(config);
        console.log("Connection established")
    } catch (e) {
        console.log(e.message)
    }
}


connect()
app.listen(port);

//? Function to send image to db 

const uploadFile = (file, keyName) => {

    return new Promise((resolve, reject) => {
        try {
            var fs = require('fs');
            const BUCKET = 'tekriture';
            file = fs.readFileSync("https://www.creativefabrica.com/wp-content/uploads/2023/01/01/Cute-Black-Girl-With-Blue-Eyes-And-Curly-Hair-Wearing-55649614-1.png");
            const uploadParams = {
                Bucket: BUCKET,
                Key: keyName,
                Body: file
            };

            s3.upload(uploadParams, function (err, data) {
                if (err) {
                    console.log(err.message)
                    return reject(err);
                }
                if (data) {
                    console.log(data)
                    return resolve(data);
                }
            });
        } catch (err) {
            console.log(err.message)
            return reject(err);
        }
    })
}

//? Get Imge from AWS

// const getSignUrlForFile = (key) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const path = require('path');
//             const fileName = path.basename(key);

//             var params = {
//                 Bucket: 'tekriture',
//                 Key: key,
//                 Expires: 30 * 60
//             };

//             const signedUrl = s3.getSignedUrl('getObject', params);
//             if (signedUrl) {
//                 return resolve({
//                     signedUrl
//                 });
//             } else {
//                 return reject("Cannot create signed URL");
//             }
//         } catch (err) {
//             return reject("Cannot create signed URL!");
//         }
//     });
// }


//<meta name="referrer" content="no-referrer"></meta>
async function closeConnection() {
    try {
        poolConnection.close();
        console.log("Connection closed")
    } catch (e) {
        console.log(e.message)
    }
}



// Default route

app.get('/', (req, res) => {
    res.send(`Hi! Server is listening on port ${port}`)
});

//? Articles Queries

//! Get articles


// Get all articles
app.get('/articles', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM Articles ORDER BY ArticleId DESC`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.push(row)
        });

        res.send(result)
        console.log(result)

    } catch (e) {
        console.log(e.message)
    }
})

// Get articles by id
app.get('/articles/:id', async (req, res) => {
    const id = req.params.id

    try {
        let data = await poolConnection.request().query(`SELECT * FROM Articles WHERE ArticleId = ?`, id);
        res.send(data)
        console.log(data + " added successfully")
    } catch (e) {
        console.log(e.message)
    }

})

// TODO: Get articles by tags and by dates

//? Post articles

app.post('/articles', async (req, res) => {


    try {

        console.log("Posting article")
        let id = 1
        let idQuery = await poolConnection.request().query(`SELECT MAX(ArticleId) FROM Articles`)
        idQuery.recordset.forEach(row => {
            if (row.ArticleId) { id = id + row.ArticleId }

        });
        // upload file to AWS
        uploadFile(req.body.ArticleImage, String(req.body.ArticleTitle))

        console.log(
            "Running Query"
        )
        let data = await poolConnection.request().query(`INSERT INTO  Articles (ArticleId, ArticleTitle, ArticleBody, ArticleImage, ArticleDate, ArticleAudio, ArticleTags, CategoryId) VALUES ( 7 , '" +req.body.ArticleTitle+"', '" +req.body.ArticleBody+"', '" +(req.body.ArticleImage+"', '" +req.body.ArticleDate+"', '" +req.body.ArticleAudio+"', '" +req.body.ArticleTags+"', 1)`);
        res.send(data)
        console.log(data + " added successfully")
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
            result.push(row)
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


//? Categories Queries

//! Get category


// Get all category
app.get('/category', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM category ORDER BY CategoryId DESC`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.push(row)
        });

        res.send(result)
        console.log(result)

    } catch (e) {
        console.log(e.message)
    }
})

// Get category by id
app.get('/category/:id', async (req, res) => {
    const id = req.params.id

    try {
        let data = await poolConnection.request().query(`SELECT * FROM Category WHERE CategoryId = ?`, id);
        res.send(data)
        console.log(data + " added successfully")
    } catch (e) {
        console.log(e.message)
    }

})

// TODO: Get categories by tags and by dates

//? Post category

app.post('/category', async (req, res) => {

    try {
        let id = 1
        let idQuery = await poolConnection.request().query(`SELECT * FROM Category ORDER BY CategoryId DESC LIMIT 1`)
        idQuery.recordset.forEach(row => {
            id = id + row.CategoryId
        });
        let data = await poolConnection.request().query(`INSERT INTO  Category (CategoryId, CategoryName) VALUES (?)`, [id, req.body.CategoryName]);
        res.send(data)
        console.log(data + " added successfully")
    } catch (e) {
        console.log(e.message)
    }
})


//? Scenes Queries

//! Get scenes


// Get all scenes
app.get('/scenes', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM scenes`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.push(row)
        });

        res.send(result)

    } catch (e) {
        console.log(e.message)
    }
})

// Get scenes by id
app.get('/scenes/:id', async (req, res) => {
    const id = req.params.id

    try {
        let data = await poolConnection.request().query(`SELECT * FROM Scenes WHERE SceneId = $id`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }

})

//? Post scenes

app.post('/scenes', async (req, res) => {

    try {
        let data = await poolConnection.request().query(`INSERT INTO  Scenes  $req`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }
})


//? Users Queries

//! Get users


// Get all users
app.get('/users', async (req, res) => {

    try {
        var resultSet = await poolConnection.request().query(`SELECT * FROM Users`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        var result = [];

        resultSet.recordset.forEach(row => {
            result.push(row)
        });

        res.send(result)

    } catch (e) {
        console.log(e.message)
    }
})

// This will serve as auth function for the moment
app.get('/users/:id', async (req, res) => {
    const assertion = req.header('X-Goog-IAP-JWT-Assertion');
    let email = 'None';
    try {
      const info = await validateAssertion(assertion);
      email = info.email;
    } catch (error) {
      console.log(error);
    }
    res.send(email)
    res.status(200).send(`Hello ${email}`).end();
  });

//? Post users

app.post('/User', async (req, res) => {

    try {
        let data = await poolConnection.request().query(`INSERT INTO  users  $req`);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }
})

// TODO: Work on the comments and users table. 


//TODO: Work on the auth and storage : Done


