const express = require('express');
const fs = require('fs');
const cors = require('cors');
const parser = require('body-parser')

// Config defaults
let PORT = '3000'
let WIKI_FILES_DIRECTORY = 'wikifiles'
let FILE_SYNC_RECORD_NAME = 'files.json'
let WIKI_PUBLISHED_PAGE_FOLDER = 'pages'
let WIKI_PUBLISHED_IMAGE_FOLDER = 'images'
let DEBUG_MODE = false

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
WIKI_PUBLISHED_IMAGE_FOLDER = loadConfig(config.wikiPublishedImageDirectory, WIKI_PUBLISHED_IMAGE_FOLDER)
DEBUG_MODE = loadConfig(config.debug, DEBUG_MODE)
const FILE_SYNC_RECORD_PATH = `${WIKI_FILES_DIRECTORY}/${FILE_SYNC_RECORD_NAME}`
const WIKI_PUBLISHED_PAGE_PATH = `${WIKI_FILES_DIRECTORY}/${WIKI_PUBLISHED_PAGE_FOLDER}`
const WIKI_PUBLISHED_IMAGE_PATH = `${WIKI_FILES_DIRECTORY}/${WIKI_PUBLISHED_IMAGE_FOLDER}`

// Initializes necessary directories and files
const ensureDirectory = (path) => { if (!fs.existsSync(path)) fs.mkdirSync(path) }
const ensureFile = (path, defaultContents) => { if (!fs.existsSync(path)) fs.writeFileSync(path, defaultContents) }
ensureDirectory(WIKI_FILES_DIRECTORY)
ensureDirectory(WIKI_PUBLISHED_PAGE_PATH)
ensureDirectory(WIKI_PUBLISHED_IMAGE_PATH)
ensureFile(FILE_SYNC_RECORD_PATH, '{}')


// Initialize express app
const app = express();
app.use(parser.json({limit:'16mb'}))
app.use(cors());
app.use('/image', express.static(WIKI_PUBLISHED_IMAGE_PATH))
const port = parseInt(PORT);

// Make sure server and client secret match
const verifySecret = (requestSecret) => requestSecret === `Bearer ${config.secret}`
// Returns file sync record as JSON object
const loadFileSyncJSON = () => JSON.parse(fs.readFileSync(FILE_SYNC_RECORD_PATH))
// Returns true if an entry in the file sync record matches the request content
const checkSyncStatus = (reqContent, fileSyncInfo) => ((reqContent, record) => (record !== undefined && record.path === reqContent.path && record.lastModified === reqContent.lastModified))(reqContent, fileSyncInfo[reqContent.name])

const removePublishedFile = (recordEntry, endpointName) => {
    removeFilePath = recordEntry.path
    root = WIKI_PUBLISHED_PAGE_PATH
    if (recordEntry.type === 'image') root = WIKI_PUBLISHED_IMAGE_PATH

    if (fs.existsSync(`${root}/${removeFilePath}`)) {
        if (DEBUG_MODE) console.log(`[${endpointName}] Removed file at path "${root}/${removeFilePath}"`)
        fs.rmSync(`${root}/${removeFilePath}`)
    }

    const pathDirs = removeFilePath.split('/')
    for (let i = 0; i < pathDirs.length - 1; i++) {
        const dirPath = `${root}/${pathDirs.slice(0, pathDirs.length - 1 - i).join('/')}`
        if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory() && fs.readdirSync(dirPath).length === 0) {
            fs.rmdirSync(dirPath)
            if (DEBUG_MODE) console.log(`[${endpointName}] Removed directory at path "${dirPath}"`)
        }
    }
}

// Endpoint to test server connection
app.get('/test-connection', (req, res) => {
    res.status(202).send('Server running')
})

TEST_CONNECTION_ENDPOINT = '/test-connection'
// Endpoint to test server connection
app.post(TEST_CONNECTION_ENDPOINT, (req, res) => {
    if (verifySecret(req.headers['authorization'])) {
        if (DEBUG_MODE) console.log(`[${TEST_CONNECTION_ENDPOINT}] Able to verify secret`)
        res.status(200).send()
    } else {
        res.status(202).send('Unauthorized')
        if (DEBUG_MODE) console.log(`[${TEST_CONNECTION_ENDPOINT}] Unable to verify secret`)
    }
})

// Returns a true or false sync status based on whether or not
// client file status matches an entry in the server sync record
FILE_SYNC_STATUS_ENDPOINT = '/get-file-sync-status'
app.post(FILE_SYNC_STATUS_ENDPOINT, (req, res) => {
    // Verify secret
    const reqContent = req.body
    if (!verifySecret(req.headers['authorization'])) {
        res.status(202).send('Unauthorized')
        if (DEBUG_MODE) console.log(`[${FILE_SYNC_STATUS_ENDPOINT}] Unable to verify secret`)
        return
    }

    if (DEBUG_MODE) console.log(`[${FILE_SYNC_STATUS_ENDPOINT}] Able to verify secret`)

    // Verify request body is valid
    if (reqContent.name === undefined || reqContent.path === undefined || reqContent.lastModified === undefined) {
        if (DEBUG_MODE) {
            if (reqContent.name === undefined) console.log(`[${FILE_SYNC_STATUS_ENDPOINT}] Invalid body: Missing "name" field`)
            if (reqContent.path === undefined) console.log(`[${FILE_SYNC_STATUS_ENDPOINT}] Invalid body: Missing "path" field`)
            if (reqContent.lastModified === undefined) console.log(`[${FILE_SYNC_STATUS_ENDPOINT}] Invalid body: Missing "lastModified" field`)
        }
        res.status(202).send('Invalid body')
        return
    }

    if (DEBUG_MODE) console.log(`[${FILE_SYNC_STATUS_ENDPOINT}] Received file data: ${JSON.stringify(reqContent)}`)

    // If request data matches server file data, response with a true status, otherwise, respond with a false status
    let fileSyncRecord = loadFileSyncJSON()
    if (DEBUG_MODE) console.log(`[${FILE_SYNC_STATUS_ENDPOINT}] found server record: ${JSON.stringify(fileSyncRecord[reqContent.name])}`)
    let syncStatus = checkSyncStatus(reqContent, fileSyncRecord)
    if (DEBUG_MODE) console.log(`[${FILE_SYNC_STATUS_ENDPOINT}] Responding with sync status: ${syncStatus}`)
    res.status(200).json({ 'syncStatus' : syncStatus }).send()
})

// Removes the requested file from the server
REMOVE_FILE_ENDPOINT = '/remove-published-file'
app.post(REMOVE_FILE_ENDPOINT, (req, res) => {
    // Verify secret
    const reqContent = req.body
    if (!verifySecret(req.headers['authorization'])) {
        res.status(202).send('Unauthorized')
        if (DEBUG_MODE) console.log(`[${REMOVE_FILE_ENDPOINT}] Unable to verify secret`)
        return
    }
    if (DEBUG_MODE) console.log(`[${REMOVE_FILE_ENDPOINT}] Able to verify secret`)


    // Verify request body is valid
    if (reqContent.name === undefined) {
        if (DEBUG_MODE)  console.log(`[${REMOVE_FILE_ENDPOINT}] Invalid body: Missing "name" field`)
        res.status(202).send('Invalid body')
        return
    }

    // If the file staged for deletion is already not on 
    // the server, respond with a postive status
    let fileSyncRecord = loadFileSyncJSON()
    if (DEBUG_MODE) console.log(`[${REMOVE_FILE_ENDPOINT}] found server record: ${JSON.stringify(fileSyncRecord[reqContent.name])}`)
    const recordEntry = fileSyncRecord[reqContent.name]
    if (recordEntry === undefined) {
        if (DEBUG_MODE) console.log(`[${REMOVE_FILE_ENDPOINT}] Record entry does not exist. File is "already removed"`)
        res.status(200).json({ 'removeStatus' : true }).send()
        return
    }

    // Remove the requested file, along with any empty parent directories, and its record in the sync record
    // console.log(`Removing page at path ${removeFilePath}`)
    removePublishedFile(recordEntry, REMOVE_FILE_ENDPOINT)
    fileSyncRecord[reqContent.name] = undefined
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, JSON.stringify(fileSyncRecord))
    res.status(200).json({ 'removeStatus' : true }).send()
})



// Syncs the contents, location, and information about a server file
SYNC_FILE_ENDPOINT = '/sync-published-file'
app.post(SYNC_FILE_ENDPOINT, (req, res) => {
    // Verify secret
    const reqContent = req.body
    if (!verifySecret(req.headers['authorization'])) {
        res.status(202).send('Unauthorized')
        if (DEBUG_MODE) console.log(`[${SYNC_FILE_ENDPOINT}] Unable to verify secret`)
        return
    }
    if (DEBUG_MODE) console.log(`[${SYNC_FILE_ENDPOINT}] Able to verify secret`)

    // Verify request body is valid
    if (reqContent.name === undefined || reqContent.path === undefined || reqContent.lastModified === undefined || reqContent.markdown === undefined) {
        res.status(202).send('Invalid body')
        if (DEBUG_MODE) {
            if (reqContent.name === undefined) console.log(`[${SYNC_FILE_ENDPOINT}] Invalid body: Missing "name" field`)
            if (reqContent.path === undefined) console.log(`[${SYNC_FILE_ENDPOINT}] Invalid body: Missing "path" field`)
            if (reqContent.lastModified === undefined) console.log(`[${SYNC_FILE_ENDPOINT}] Invalid body: Missing "lastModified" field`)
            if (reqContent.markdown === undefined) console.log(`[${SYNC_FILE_ENDPOINT}] Invalid body: Missing "markdown" field`)
        }
        return
    }

    // Remove any previously published version of the file, along
    // with its record (in case the fild has moved)
    let fileSyncRecord = loadFileSyncJSON()
    if (DEBUG_MODE) console.log(`[${SYNC_FILE_ENDPOINT}] found server record: ${JSON.stringify(fileSyncRecord[reqContent.name])}`)
    const recordEntry = fileSyncRecord[reqContent.name]
    if (recordEntry !== undefined) removePublishedFile(recordEntry)

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
            if (DEBUG_MODE) console.log(`[${SYNC_FILE_ENDPOINT}] Created file at path "${buildPath}"`)
            fs.writeFileSync(buildPath, reqContent.markdown)
        } else {
            // For each directory the file is a child of, ensure the directory exists
            if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath)
            if (DEBUG_MODE) console.log(`[${SYNC_FILE_ENDPOINT}] Created directory at path "${buildPath}"`)
            buildPath += '/'
        }
    });

    // Update the sync file record to reflect the information of the updated file
    fileSyncRecord[reqContent.name] = {
        "path" : reqContent.path,
        "lastModified" : reqContent.lastModified,
        "type" : "text"
    }
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, JSON.stringify(fileSyncRecord))
    // Send a positive response
    res.status(200).json({ syncStatus : true }).send()
})

// Syncs the contents, location, and information about a server file
SYNC_IMAGE_ENDPOINT = '/sync-image-file'
app.post(SYNC_IMAGE_ENDPOINT, (req, res) => {
    // Verify secret
    const reqContent = req.body
    if (!verifySecret(req.headers['authorization'])) {
        res.status(202).send('Unauthorized')
        if (DEBUG_MODE) console.log(`[${SYNC_IMAGE_ENDPOINT}] Unable to verify secret`)
        return
    }
    if (DEBUG_MODE) console.log(`[${SYNC_IMAGE_ENDPOINT}] Able to verify secret`)

    // Verify request body is valid
    if (reqContent.name === undefined || reqContent.path === undefined || reqContent.lastModified === undefined || reqContent.base64 === undefined) {
        res.status(202).send('Invalid body')
        if (DEBUG_MODE) {
            if (reqContent.name === undefined) console.log(`[${SYNC_IMAGE_ENDPOINT}] Invalid body: Missing "name" field`)
            if (reqContent.path === undefined) console.log(`[${SYNC_IMAGE_ENDPOINT}] Invalid body: Missing "path" field`)
            if (reqContent.lastModified === undefined) console.log(`[${SYNC_IMAGE_ENDPOINT}] Invalid body: Missing "lastModified" field`)
            if (reqContent.base64 === undefined) console.log(`[${SYNC_IMAGE_ENDPOINT}] Invalid body: Missing "base64" field`)
        }
        return
    }

    // Remove any previously published version of the file, along
    // with its record (in case the fild has moved)
    let fileSyncRecord = loadFileSyncJSON()
    if (DEBUG_MODE) console.log(`[${SYNC_IMAGE_ENDPOINT}] found server record: ${JSON.stringify(fileSyncRecord[reqContent.name])}`)
    const recordEntry = fileSyncRecord[reqContent.name]
    if (recordEntry !== undefined) removePublishedFile(recordEntry)

    // Ensure that the required directory path to the uploaded file 
    // exists, and  then write the file contents to the desired path
    const path = reqContent.path.split('/')
    // Failsafe to ensure website config files do not get published on accident
    if (path[0] === 'wikimaker-website-config') {
        res.status(202).json({ configFileFailsafe : true }).send()
        return
    }

    const imageBuffer = Buffer.from(reqContent.base64, "base64");
    let buildPath = `${WIKI_PUBLISHED_IMAGE_PATH}/`
    path.forEach((element, index) => {
        buildPath += element
        if (index === path.length - 1) {
            // Write the markdown contents to the final file location
            if (DEBUG_MODE) console.log(`[${SYNC_IMAGE_ENDPOINT}] Created file at path "${buildPath}"`)
            fs.writeFileSync(buildPath, imageBuffer)
        } else {
            // For each directory the file is a child of, ensure the directory exists
            if (!fs.existsSync(buildPath)) fs.mkdirSync(buildPath)
            if (DEBUG_MODE) console.log(`[${SYNC_IMAGE_ENDPOINT}] Created directory at path "${buildPath}"`)
            buildPath += '/'
        }
    });

    // Update the sync file record to reflect the information of the updated file
    fileSyncRecord[reqContent.name] = {
        "path" : reqContent.path,
        "lastModified" : reqContent.lastModified,
         "type" : "image"
    }
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, JSON.stringify(fileSyncRecord))
    // Send a positive response
    res.status(200).json({ syncStatus : true }).send()
})

RESET_PAGES_ENDPOINT = '/reset-published-pages'
app.post(RESET_PAGES_ENDPOINT, (req, res) => {
    // Verify secret
    if (!verifySecret(req.headers['authorization'])) {
        res.status(202).send('Unauthorized')
        if (DEBUG_MODE) console.log(`[${SYNC_IMAGE_ENDPOINT}] Unable to verify secret`)
        return
    }
    if (DEBUG_MODE) console.log(`[${SYNC_IMAGE_ENDPOINT}] Able to verify secret`)
    

    // Clear all published files, and reset file sync record
    fs.rmSync(WIKI_PUBLISHED_PAGE_PATH, {recursive : true})
    fs.rmSync(WIKI_PUBLISHED_IMAGE_PATH, {recursive : true})
    fs.mkdirSync(WIKI_PUBLISHED_PAGE_PATH)
    fs.mkdirSync(WIKI_PUBLISHED_IMAGE_PATH)
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, '{}')
    if (DEBUG_MODE) console.log(`[${SYNC_IMAGE_ENDPOINT}] Cleared server wiki files`)

    res.status(200).send()
})

RETRIEVE_ARTICLE_ENDPOINT = '/retrieve-article'
app.post(RETRIEVE_ARTICLE_ENDPOINT, (req, res) => {
    // Verify request body is valid
    const reqContent = req.body
    if (reqContent.path === undefined) {
        res.status(202).send('Invalid body')
        if (DEBUG_MODE) console.log(`[${RETRIEVE_ARTICLE_ENDPOINT}] Invalid body: Missing "path" field`)
        return
    }
    const fileExists = fs.existsSync(`${WIKI_PUBLISHED_PAGE_PATH}/${reqContent.path}`)
    if (fileExists) {
        if (DEBUG_MODE) console.log(`[${RETRIEVE_ARTICLE_ENDPOINT}] Sending file contents from path "${WIKI_PUBLISHED_PAGE_PATH}/${reqContent.path}"`)
        res.status(200).sendFile(`${__dirname}/${WIKI_PUBLISHED_PAGE_PATH}/${reqContent.path}`)
    } else {
        res.status(202).send('File does not exist')
        if (DEBUG_MODE) console.log(`[${RETRIEVE_ARTICLE_ENDPOINT}] File at path ${WIKI_PUBLISHED_PAGE_PATH}/${reqContent.path} could not be found`)
    }
})

LOCATE_FILE_ENDPOINT = '/locate'
app.post(LOCATE_FILE_ENDPOINT, (req, res) => {
    // Verify request body is valid
    const reqContent = req.body
    if (reqContent.name === undefined) {
        res.status(202).send('Invalid body')
        if (DEBUG_MODE) console.log(`[${LOCATE_FILE_ENDPOINT}] Invalid body: Missing "name" field`)
        return
    }

    const json = loadFileSyncJSON()
    if (json[reqContent.name]) {
        if (DEBUG_MODE) console.log(`[${LOCATE_FILE_ENDPOINT}] Located file at path "${json[reqContent.name].path}"`)
        res.status(200).json({ path : json[reqContent.name].path }).send()
    } else {
        if (DEBUG_MODE) console.log(`[${LOCATE_FILE_ENDPOINT}] Could not locate file (file does not exist)`)
        res.status(202).send('File does not exist')
    }

})

// Set express app to listen on the designated port
app.listen(port, () => { console.log(`Server listening on port ${port}`) });