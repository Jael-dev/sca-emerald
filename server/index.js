const express = require('express')
const sql = require('mssql')
const bodyParser = require('body-parser');
const cors = require('cors');
const metadata = require('gcp-metadata');
const {OAuth2Client} = require('google-auth-library');
const AWS = require('aws-sdk');
var fs = require('fs');
const app = express()
const oAuth2Client = new OAuth2Client();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb', parameterLimit: 100000, }));
app.use(cors());
app.use(express.urlencoded({ extended: true }))


//! Auth functions

var newFile = null;
let aud;

async function audience() {
  if (!aud && (await metadata.isAvailable())) {
    let project_number = await metadata.project('748322273584');
    let project_id = await metadata.project('tekriture');

    aud = '/projects/' + project_number + '/apps/' + project_id;
  }

  return aud;
}

async function validateAssertion(assertion) {
    if (!assertion) {
      return {};
    }
  
    const aud = await audience();
  
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
const port = 3000;


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

const uploadFile = (keyName) => {

    fs.readFile(keyName, (err, data) => {
        if (err) throw err;
        const params = {
            Bucket: BUCKET ,
            Key: keyName, 
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
        });
     });

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
        
        newFile = await fs.writeFile(req.body.ArticleTitle+".txt" , req.body.ArticleTitle+' file created with the following information. 1) Title: '+req.body.ArticleTitle+', 2)Body: ' +req.body.ArticleBody+ ", 3)Creation Date: "+req.body.ArticleDate+ "and other information I will upload later", function (err) {
            if (err) throw err;
            console.log('File is created successfully.')
          });
        newFile = await fs.writeFile(req.body.ArticleTitle+".txt" , req.body.ArticleTitle+' file created with the following information. 1) Title: '+req.body.ArticleTitle+', 2)Body: ' +req.body.ArticleBody+ ", 3)Creation Date: "+req.body.ArticleDate+ "and other information I will upload later", function (err) {
            if (err) throw err;
            console.log('File is created successfully.')
          });
        // upload file to AWS
        uploadFile(req.body.ArticleTitle+".txt")

        console.log(
            "Running Query"
        )
        
        let data = await poolConnection.request()
        .input('id', sql.Int, req.body.ArticleId)
        .input('title', sql.VarChar(250), req.body.ArticleTitle)
        .input('body', sql.VarChar(250), req.body.ArticleBody)
        .input('image', sql.VarChar(250), req.body.ArticleImage)
        .input('date', sql.VarChar(250), req.body.ArticleDate)
        .input('audio', sql.VarChar(250), req.body.ArticleAudio)
        .input('tags', sql.VarChar(250), String(req.body.ArticleTags))
        .input('category', sql.Int, 1)
        .query(`INSERT INTO Articles 
        VALUES
        (
            @id, @title, @body, @image, @date, @audio, @tags, @category
        )` );
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
app.get('/user', async (req, res) => {
    const assertion = req.header('X-Goog-IAP-JWT-Assertion');
    let email = 'None';
    try {
      const info = await validateAssertion(assertion);
      email = info.email;
    } catch (error) {
      console.log(error);
    }
    res.send(email)
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


