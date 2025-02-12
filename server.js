const express = require('express');
const fs = require('fs');

const FILE_SYNC_RECORD_PATH = 'wikifiles/pages.json'
const WIKI_FILES_ROOT_DIRECTORY = 'wikifiles/pages'

let config = {}
if (fs.existsSync('config.json')) {
    fs.readFile('config.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Unable to open \'config.json\'. Restore this file and restart the server.')
            return;
        }
        try {
            config = JSON.parse(data);
            console.log("Server configuration loaded:")
            console.log(config)
          } catch (parseError) {
            console.log('Could not parse \'config.json\'. Restore this file and restart the server.');
          }
    })
} else {
    console.log('Could not find file \'config.json\'. Restore this file and restart the server.')
}

if (!fs.existsSync('wikifiles')) {
    fs.mkdirSync('wikifiles')
}
if (!fs.existsSync('wikifiles/pages')) {
    fs.mkdirSync('wikifiles/pages')
}
if (!fs.existsSync(FILE_SYNC_RECORD_PATH)) {
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, '{}')
}


const app = express();
app.use(express.json())
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/test-connection', (req, res) => {
    const json = req.body
    if (json.secret === config.secret) {
        res.status(200).send()
    } else {
        res.status(202).send('Unauthorized')
    }
    
})

app.post('/get-file-sync-status', (req, res) => {
    const json = req.body
    if (json.secret !== config.secret) {
        res.status(202).send('Unauthorized')
    }

    const reqContent = json.content
    let fileSyncRecord = JSON.parse(fs.readFileSync(FILE_SYNC_RECORD_PATH))

    if (reqContent.name === undefined || reqContent.path === undefined || reqContent.lastModified === undefined) {
        res.status(202).send('Invalid body')
    }

    if (fileSyncRecord[reqContent.name] !== undefined && fileSyncRecord[reqContent.name].path === reqContent.path && fileSyncRecord[reqContent.name].lastModified === reqContent.lastModified) {
        res.status(200).json({
            'syncStatus' : true
        }).send()
        return
    } else {
        res.status(200).json({
            'syncStatus' : false
        }).send()
        return
    }
})

app.post('/remove-published-file', (req, res) => {
    const json = req.body
    if (json.secret !== config.secret) {
        res.status(202).send('Unauthorized')
    }

    const reqContent = json.content
    let fileSyncRecord = JSON.parse(fs.readFileSync(FILE_SYNC_RECORD_PATH))

    if (reqContent.name === undefined) {
        res.status(202).send('Invalid body')
    }

    if (fileSyncRecord[reqContent.name] === undefined) {
        res.status(200).json({
            'removeStatus' : true
        }).send()
        return
    } else {
        console.log(`Removing page at path ${fileSyncRecord[reqContent.name].path}`)
        if (fs.existsSync(`${WIKI_FILES_ROOT_DIRECTORY}/${fileSyncRecord[reqContent.name].path}`)) {
            fs.rmSync(`${WIKI_FILES_ROOT_DIRECTORY}/${fileSyncRecord[reqContent.name].path}`)
        }
        fileSyncRecord[reqContent.name] = undefined
        fs.writeFileSync(FILE_SYNC_RECORD_PATH, JSON.stringify(fileSyncRecord))
    }



    if (fileSyncRecord[reqContent.name] !== undefined && fileSyncRecord[reqContent.name].path === reqContent.path && fileSyncRecord[reqContent.name].lastModified === reqContent.lastModified) {
        res.status(200).json({
            'syncStatus' : true
        }).send()
        console.log('Sending \'true\' sync status')
    } else {
        res.status(200).json({
            'syncStatus' : false
        }).send()
        console.log('Sending \'false\' sync status')
    }
})

app.post('/sync-published-file', (req, res) => {
    const json = req.body
    if (json.secret !== config.secret) {
        res.status(202).send('Unauthorized')
    }

    const reqContent = json.content
    let fileSyncRecord = JSON.parse(fs.readFileSync(FILE_SYNC_RECORD_PATH))

    if (reqContent.name === undefined || reqContent.path === undefined || reqContent.lastModified === undefined || reqContent.markdown === undefined) {
        res.status(202).send('Invalid body')
    }

    if (fileSyncRecord[reqContent.name] !== undefined) {
        console.log(`Removing page at path ${fileSyncRecord[reqContent.name].path}`)
        if (fs.existsSync(`${WIKI_FILES_ROOT_DIRECTORY}/${fileSyncRecord[reqContent.name].path}`)) {
            fs.rmSync(`${WIKI_FILES_ROOT_DIRECTORY}/${fileSyncRecord[reqContent.name].path}`)
        }
        fileSyncRecord[reqContent.name] = undefined

    }

    const path = reqContent.path.split('/')
    let buildPath = `${WIKI_FILES_ROOT_DIRECTORY}/`
    path.forEach((element, index) => {
        buildPath += element
        if (index === path.length - 1) {
            fs.writeFileSync(buildPath, reqContent.markdown)
        } else {
            if (!fs.existsSync(buildPath)) {
                fs.mkdirSync(buildPath)
            }
            buildPath += '/'
        }
    });

    res.status(200).json({
        syncStatus : true
    }).send()
    
    fileSyncRecord[reqContent.name] = {
        "path" : reqContent.path,
        "lastModified" : reqContent.lastModified
    }
    fs.writeFileSync(FILE_SYNC_RECORD_PATH, JSON.stringify(fileSyncRecord))
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});