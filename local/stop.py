import json
import os

env_template = open('src/env-template.txt', 'r').read().strip()

config = json.loads(open('local/config.json', 'r').read())
port = str(config["port"])
os.system(f'lsof -i :{port} -t | xargs kill -9')