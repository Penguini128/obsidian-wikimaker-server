const express = require('express');
const fs = require('fs');
const cors = require('cors');

// Config defaults
let PORT = '3000'
let WIKI_FILES_DIRECTORY = 'wikifiles'
let FILE_SYNC_RECORD_NAME = 'pages.json'
let WIKI_PUBLISHED_PAGE_FOLDER = 'pages'

// Loads server configuration file
let config = {}
if (fs.existsSync('config.json')) {
    const configData = fs.readFileSync('config.json')
    try {
        config = JSON.parse(configData);
        console.log("Server configuration loaded:")
        console.log(config)
    } catch (parseError) {
        console.log('Could not parse \'config.json\'. Restore this file and restart the server.');
    }
} else {
    console.log('Could not find file \'config.json\'. Restore this file and restart the server.')
}

if (config.secret === undefined) {
    console.log('Server secret must be specified in \'config.json\'. Restore this file and restart the server.')
}

// Load config settings
const loadConfig = (config, defaultValue) => config === undefined ? defaultValue : config
PORT = loadConfig(config.port, PORT)
WIKI_FILES_DIRECTORY = loadConfig(config.wikiFilesDirectory, WIKI_FILES_DIRECTORY)
FILE_SYNC_RECORD_NAME = loadConfig(config.fileSyncRecordName, FILE_SYNC_RECORD_NAME)
WIKI_PUBLISHED_PAGE_FOLDER = loadConfig(config.wikiPublishedPageDirectory, WIKI_PUBLISHED_PAGE_FOLDER)
const FILE_SYNC_RECORD_PATH = `${WIKI_FILES_DIRECTORY}/${FILE_SYNC_RECORD_NAME}`
const WIKI_PUBLISHED_PAGE_PATH = `${WIKI_FILES_DIRECTORY}/${WIKI_PUBLISHED_PAGE_FOLDER}`

// Initializes necessary directories and files
const ensureDirectory = (path) => { if (!fs.existsSync(path)) fs.mkdirSync(path) }
const ensureFile = (path, defaultContents) => { if (!fs.existsSync(path)) fs.writeFileSync(path, defaultContents) }
ensureDirectory(WIKI_FILES_DIRECTORY)
ensureDirectory(WIKI_PUBLISHED_PAGE_PATH)
ensureFile(FILE_SYNC_RECORD_PATH, '{}')


// Initialize express app
const app = express();
app.use(express.json())
app.use(cors());
const port = parseInt(PORT);

// Make sure server and client secret match
const verifySecret = (requestSecret) => requestSecret === config.secret
// Returns file sync record as JSON object
const loadFileSyncJSON = () => JSON.parse(fs.readFileSync(FILE_SYNC_RECORD_PATH))
// Returns true if an entry in the file sync record matches the request content
const checkSyncStatus = (reqContent, fileSyncInfo) => ((reqContent, record) => (record !== undefined && record.path === reqContent.path && record.lastModified === reqContent.lastModified))(reqContent, fileSyncInfo[reqContent.name])

const removePublishedFile = (removeFilePath) => {
    if (fs.existsSync(`${WIKI_PUBLISHED_PAGE_PATH}/${removeFilePath}`)) {
        fs.rmSync(`${WIKI_PUBLISHED_PAGE_PATH}/${removeFilePath}`)
    }
    const pathDirs = removeFilePath.split('/')
    for (let i = 0; i < pathDirs.length - 1; i++) {
        const dirPath = `${WIKI_PUBLISHED_PAGE_PATH}/${pathDirs.slice(0, pathDirs.length - 1 - i).join('/')}`
        if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory() && fs.readdirSync(dirPath).length === 0) {
            console.log(`Removing directory at path ${dirPath}`)
            fs.rmdirSync(dirPath)
        }
    }
}

// Endpoint to test server connection
app.get('/test-connection', (req, res) => {
    res.status(202).send('Server running')
})

// Endpoint to test server connection
app.post('/test-connection', (req, res) => {
    const json = req.body
    if (verifySecret(json.secret)) res.status(200).send()
    else res.status(202).send('Unauthorized')
})

// Returns a true or false sync status based on whether or not
// client file status matches an entry in the server sync record
app.post('/get-file-sync-status', (req, res) => {
    // Verify secret
    const json = req.body
    if (!verifySecret(json.secret)) {
        res.status(202).send('Unauthorized')
        return
    }

    // Verify request body is valid
    const reqContent = json.content
    if (reqContent.name === undefined || reqContent.path === undefined || reqContent.lastModified === undefined) {
        res.status(202).send('Invalid body')
    }

    // If request data matches server file data, response with a true status, otherwise, respond with a false status
    let fileSyncRecord = loadFileSyncJSON()
    let syncStatus = checkSyncStatus(reqContent, fileSyncRecord)
    res.status(200).json({ 'syncStatus' : syncStatus }).send()
})

// Removes the requested file from the server
app.post('/remove-published-file', (req, res) => {
    // Verify secret
    const json = req.body
    if (!verifySecret(json.secret)) {
        res.status(202).send('Unauthorized')
        return
    }

    // Verify request body is valid
    const reqContent = json.content
    if (reqContent.name === undefined) {
        res.status(202).send('Invalid body')
    }

    // If the file staged for deletion is already not on 
    // the server, respond with a postive status
    let fileSyncRecord = loadFileSyncJSON()
    const recordEntry = fileSyncRecord[reqContent.name]
    if (recordEntry === undefined) {
        res.status(200).json({ 'removeStatus' : true }).send()
        return
    }

    // Remove the requested file, along with any empty parent directories, and its record in the sync record
    const removeFilePath = recordEntry.path 
    console.log(`Removing page at path ${removeFilePath}`)
    removePublishedFile(removeFilePath)
    fileSyncRecord[reqContent.name] = undefined
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, JSON.stringify(fileSyncRecord))
    res.status(200).json({ 'removeStatus' : true }).send()
})

// Syncs the contents, location, and information about a server file
app.post('/sync-published-file', (req, res) => {
    // Verify secret
    const json = req.body
    if (!verifySecret(json.secret)) {
        res.status(202).send('Unauthorized')
        return
    }

    // Verify request body is valid
    const reqContent = json.content
    if (reqContent.name === undefined || reqContent.path === undefined || reqContent.lastModified === undefined || reqContent.markdown === undefined) {
        res.status(202).send('Invalid body')
        return
    }

    // Remove any previously published version of the file, along
    // with its record (in case the fild has moved)
    let fileSyncRecord = loadFileSyncJSON()
    const recordEntry = fileSyncRecord[reqContent.name]
    if (recordEntry !== undefined) removePublishedFile(recordEntry.path)

    // Ensure that the required directory path to the uploaded file 
    // exists, and  then write the file contents to the desired path
    const path = reqContent.path.split('/')
    // Failsafe to ensure website config files do not get published on accident
    if (path[0] === 'wikimaker-website-config') {
        res.status(202).json({ configFileFailsafe : true }).send()
        return
    }
    let buildPath = `${WIKI_PUBLISHED_PAGE_PATH}/`
    path.forEach((element, index) => {
        buildPath += element
        if (index === path.length - 1) {
            // Write the markdown contents to the final file location
            fs.writeFileSync(buildPath, reqContent.markdown)
        } else {
            // For each directory the file is a child of, ensure the directory exists
            if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath)
            buildPath += '/'
        }
    });

    // Update the sync file record to reflect the information of the updated file
    fileSyncRecord[reqContent.name] = {
        "path" : reqContent.path,
        "lastModified" : reqContent.lastModified
    }
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, JSON.stringify(fileSyncRecord))
    // Send a positive response
    res.status(200).json({ syncStatus : true }).send()
})

app.post('/reset-published-pages', (req, res) => {
    // Verify secret
    const json = req.body
    if (!verifySecret(json.secret)) {
        res.status(202).send('Unauthorized')
        return
    }

    // Clear all published files, and reset file sync record
    fs.rmSync(WIKI_PUBLISHED_PAGE_PATH, {recursive : true})
    fs.mkdirSync(WIKI_PUBLISHED_PAGE_PATH)
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, '{}')

    res.status(200).send()
})

app.post('/retrieve-article', (req, res) => {

    // Verify request body is valid
    const reqContent = req.body
    if (reqContent.path === undefined) {
        res.status(202).send('Invalid body')
        return
    }
    const fileExists = fs.existsSync(`${WIKI_PUBLISHED_PAGE_PATH}/${reqContent.path}`)
    if (fileExists) {
        res.status(200).sendFile(`${__dirname}/${WIKI_PUBLISHED_PAGE_PATH}/${reqContent.path}`)
    } else {
        res.status(202).send('File does not exist')
    }
})

app.post('/locate', (req, res) => {
    // Verify request body is valid
    const reqContent = req.body
    if (reqContent.name === undefined) {
        res.status(202).send('Invalid body')
        return
    }

    const json = loadFileSyncJSON()
    if (json[reqContent.name]) {
        res.status(200).json({ path : json[reqContent.name].path }).send()
    } else {
        res.status(202).send('File does not exist')
    }

})

// Set express app to listen on the designated port
app.listen(port, () => { console.log(`Server listening on port ${port}`) });