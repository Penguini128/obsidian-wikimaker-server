# Run python script to generate usefuls
python local/start.py

# Copy API configs and spin up API server
cp local/config.json api-server/config.json
cd api-server
npm install
nohup node server.js &

# Run Python script to convert config.json to .env for frontend server
cd ../wikimaker-web-application
npm install
cd ..
npm start --prefix wikimaker-web-application


