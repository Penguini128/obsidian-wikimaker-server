import json

env_template = open('src/env-template.txt', 'r').read().strip()

config = json.loads(open('local/config.json', 'r').read())
api_domain = config["apiDomain"]
full_api_domain = f'https://{api_domain}'
if api_domain[:9] == "localhost":
    full_api_domain = f'http://{api_domain}'
debug = str(config["debug"]).lower()

env_template = env_template.replace('[FULL_API_DOMAIN]', full_api_domain)\
    .replace('[DEBUG_MODE]', debug)

env_file = open('wikimaker-web-application/.env', 'w')
env_file.write(env_template)
env_file.close()