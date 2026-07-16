# Storefront Backend Project

## Setup and Running the App

1. Clone this repo `git clone https://github.com/benthedeveloper/storefront-backend-project.git`
2. Install NodeJS latest LTS version. I recommend using [NVM (Node Version Manager)](nvmnode.com) to easily switch between different versions of Node for different projects as needed. This should also install NPM.
3. Install dependencies: `npm install`.
4. Create a new environment variable file (named `.env`) in the root folder, refer to the `.env.example` file.
5. Create another environment variable file named `.env.test` for running Jasmine tests.
    1. For `.env.test`, set `SERVER_PORT` to a different value than what is set in `.env`, and set `POSTGRES_DB` to a different "test" value than what is set in `.env`.
6. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
7. Run `docker compose up -d postgres` in a terminal to start the Docker container with the Postgres database.
8. Run `npm run migrate:up` to run database migrations, which will create the tables in the POSTGRES_DB database set in the .env file.
9. In another terminal, run `npm run watch` to start the server on localhost.
    1. If SERVER_PORT is set to `3000` in .env for example, then if you open a browser at `http://localhost:3000/api`, then you should see message "Main api route" in your browser.
10. You may now make calls to the API. Refer to the REQUIREMENTS.md document for how to use the API.

I recommend installing Postman or any similar API platform for testing API routes.

## Technologies

This application makes use of the following libraries:

* Postgres for the database
* Node/Express for the application logic
* dotenv from npm for managing environment variables
* db-migrate from npm for migrations
* jsonwebtoken from npm for working with JWTs
* jasmine from npm for testing
* supertest from npm for testing Express routes

## Testing

* Note: Make sure `.env.test` is set up correctly as mentioned in step 5 above.
* Run `npm run test` to run all Jasmine tests for models and routes.

## Connecting to the database

After going through the setup, make sure Docker is up and running, and that you have run `npm run migrate:up`. To connect to the Postgres database in the Docker container, I recommend using a tool such as PgAdmin 4.

Just create a new server, give it a name, set Host to `localhost`, set Port to `5432`, and set the Database name, username, and password to the values that you saved in your .env file: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.

![Screenshot of PG Admin settings to connect to database](pg-admin-4-setup.png)
