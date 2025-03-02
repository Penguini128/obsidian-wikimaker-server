import json

env_template = open('src/env-template.txt', 'r').read().strip()

config = json.loads(open('config.json', 'r').read())
website_domains = config["websiteDomains"]
main_domain = website_domains.split(" ")[0]
full_main_domain = f'https://{main_domain}'
debug = str(config["debug"]).lower()

env_template = env_template.replace('[FULL_MAIN_DOMAIN]', full_main_domain)\
    .replace('[DEBUG_MODE]', debug)

env_file = open('wikimaker-web-application/.env', 'w')
env_file.write(env_template)
env_file.close()