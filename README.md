# Obsidian WikiMaker Server
## Version 0.3.3 Beta

Installation instuctions can be found [here](https://wikimaker.penguinidoesthings.com/article/Documentation/Installation%20and%20Setup/WikiMaker%20Server%20Setup)

## Configuration

Modify the fields in `config.json` to suit your needs. See [this page](https://wikimaker.penguinidoesthings.com/article/Documentation/Installation%20and%20Setup/WikiMaker%20Server%20Setup) for more information about server configuration.

## Starting the Server

The first time you start the server, run `install.sh`, which will automatically install all necessary dependancies, then start the server.
After running `install.sh` at least once, you can use `start.sh` for all future instances of starting the server.

## Stopping the Server

You can run `stop.sh` to automatically stop the server. **Note:** This does not stop nginx, the service responisble for forwarding people accessing your wiki to the website itself, but with the server stopped, no pages on the wiki will be able to load.


## Local development

For local development, all instructions are mostly the same, however, use the equivalent files located in the `local` directory, which will bypass the need for nginx and host both the API server, along with the frontend wiki, locally.