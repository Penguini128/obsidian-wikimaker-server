# Run python script to generate usefuls
python src/start.py

# Copy API configs and spin up API server
cp config.json api-server/config.json
cd api-server
npm install
nohup node server.js & :

# Run Python script to convert config.json to .env for frontend server
cd ../wikimaker-web-application
npm install
npm run build

# Return to starting directory
cd ..