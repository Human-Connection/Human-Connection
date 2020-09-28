## Introduction

GitHub Codespaces is still in beta, however when it's out we'll be able to use it to setup
a remote work environment and use it to develop this app. 

Setting up Codespaces allows for development from VS Code remotely or from the online editor
and for our teams in remote locations with weak computers this can be a big help.

## How To

The `devcontainer` is where we run most of our development for webapp and backend folders. We
profile a sidecart container for `neo4j` that can be started with docker-compose automatically
and restarted with codespaces.

We setup the project to work with `ngrok` so we can start a remote development website for each session.

Everything else just works as normal dev workflow.

Here are some helper scripts to get started:

1. Setup some alias we can use
   ```
   echo "source \"/workspace/Human-Connection/.devcontainer/profile_devcontainer_alias.sh\"">> "${HOME}/.profile
   ```

1. Make sure all containers are running
   ```
   dc ps
   dc restart neo4j
   ```

1. Start a new terminal and seed the database
   ```
   seed
   ```

1. Start an ngrok session from terminal, you may want to also login
   ```
   ngrok_start
   ```
   Use the url's to access the container

1. Use graphql function to query the database
   ```
   graphql
   ```

1. Get the schema
   ```
   graphql_schema
   ```

1. Sample check for the admin user
   ```
   get_admin
   ```