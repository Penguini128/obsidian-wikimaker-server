import json
import os

nginx_template = open('src/nginx-template.txt', 'r').read().strip()
env_template = open('src/env-template.txt', 'r').read().strip()
manual_template = open('src/manual-command-template.txt', 'r').read().strip()

config = json.loads(open('config.json', 'r').read())
api_domain = config["apiDomain"]
website_domains = config["websiteDomains"]
main_domain = website_domains.split(" ")[0]
full_api_domain = f'https://{api_domain}'
debug = str(config["debug"]).lower()
port = str(config["port"])
install_directory = os.getcwd()
nginx_config_file_name = config["nginxConfigFile"]

nginx_template = nginx_template.replace("[WEBSITE_DOMAINS]", website_domains)\
    .replace("[MAIN_DOMAIN]", main_domain)\
    .replace("[API_DOMAIN]", api_domain)\
    .replace("[API_LOCAL_PORT]", port)\
    .replace("[INSTALL_DIRECTORY]", install_directory)

env_template = env_template.replace('[FULL_API_DOMAIN]', full_api_domain)\
    .replace('[DEBUG_MODE]', debug)

dash_d_all_domains = ''
for link in website_domains.split(' '):
    if len(dash_d_all_domains) > 0:
        dash_d_all_domains += " "
    dash_d_all_domains += f'-d {link}'
dash_d_all_domains += f' -d {api_domain}'

manual_template = manual_template.replace('[DASH_D_ALL_DOMAINS]', dash_d_all_domains)

env_file = open('wikimaker-web-application/.env', 'w')
env_file.write(env_template)
env_file.close()

# nginx_file = open('nginx-config.txt', 'w')
# nginx_file.write(nginx_template)
# nginx_file.close()

# manual_file = open('manual-commands.txt', 'w')
# manual_file.write(manual_template)
# manual_file.close()

os.chdir('..')
print(os.getcwd())
os.system(f'chmod 777 -R {os.getcwd()}')
os.system(f'chown nginx:nginx -R {os.getcwd()}')

nginx_conf_file = open(f'/etc/nginx/conf.d/{nginx_config_file_name}', 'a')
nginx_conf_file.write(f'\n\n{nginx_template}')

for command in manual_template.split('\n'):
    os.system(command)