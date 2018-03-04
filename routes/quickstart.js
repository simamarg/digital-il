var express = require('express');
var router = express.Router();

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

// Load client secrets from a local file.
router.get('/', function (req, res) {
    console.log("TAMUT!!!!!!!!!!!!!!!!!!!!!!!!");
    fs.readFile('./client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        console.log("Tamut 2");
        // Authorize a client with the loaded credentials, then call the
        // Drive API.
        // authorize(JSON.parse(content), listFiles);
        authorize(JSON.parse(content), function (auth) {
            console.log("TAMUT - after auth - in callback");
            var sheets = google.sheets('v4');
            var sheetsResult = [];
            sheets.spreadsheets.values.batchGet({
                auth: auth,
                spreadsheetId: '1I2ZOluMBclTR9FAlFkAy5Wxc0GODHQHzMU0UP0QepQk',
                ranges: ['Sheet1!A1:Z', 'Sheet2!A1:Z']
            }, function (err, response) {
                console.log("TAMUT - inside batchGet");
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return;
                }
                var rows = response.valueRanges;
                console.log("Tamut - rows: " + rows);
                if (rows.length == 0) {
                    console.log('No data found.');
                } else {
                    for (let i = 0; i < rows.length; i++) {
                        sheetsResult[i] = rows[i].values;
                    }
                }

                console.log("TAMUT FINALLY - sheetsResult are shitty: " + JSON.stringify(sheetsResult));
                res.send(JSON.stringify(sheetsResult));
            });
           
        });
    });
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    console.log("Tamut - Authorize");
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        
        if (err) {
            console.log("Tamut - readFile error: " + err);
            getNewToken(oauth2Client, callback);
        } else {
            console.log("Tamut - readFile no error " + TOKEN_PATH);
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
    var service = google.drive('v3');
    service.files.list({
        auth: auth,
        pageSize: 10,
        fields: "nextPageToken, files(id, name)"
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var files = response.files;
        if (files.length == 0) {
            console.log('No files found.');
        } else {
            console.log('Files:');
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                console.log('%s (%s)', file.name, file.id);
            }
        }
    });
}

// creates a txt file
function createTextFile(auth) {
    var service = google.drive({ version: 'v3', auth: auth });
    service.files.create({
        resource: {
            'name': 'Test.txt',
            mimeType: 'text/plain'
        },
        media: {
            mimeType: 'text/plain',
            body: fs.createReadStream('myCreationTest.txt')
        },
        fields: 'id'
    }, function (err, file) {
        if (err) {
            console.log('The API returned an error: ' + err);
        } else {
            console.log('File Id: ', file.id);
        }
    });
}

// prints sheet
// function printSheet(auth) {
//     var sheets = google.sheets('v4');
//     var sheetsResult = [];
//     sheets.spreadsheets.values.batchGet({
//         auth: auth,
//         spreadsheetId: '1XPIx8DHFNxrxe26-FYHByTMo5SulJIJyZmaspYNZbq0',
//         ranges: ['Sheet1!A1:Z', 'Sheet2!A1:Z']
//     }, function (err, response) {
//         if (err) {
//             console.log('The API returned an error: ' + err);
//             return;
//         }
//         var rows = response.valueRanges;
//         if (rows.length == 0) {
//             console.log('No data found.');
//         } else {
//             for (let i=0; i < rows.length; i++) {
//                 sheetsResult[i] = rows[i].values;
//             }
//         }
//     });
// }

module.exports = router;