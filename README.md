## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 20 or later)
- [Docker](https://www.docker.com/) (for containerized deployment)
- [Postgres](https://www.postgresql.org/) (if running the database locally)
- [Redis](https://redis.io/) (if running the queue locally)

## Getting Started
1. Clone the repository and navigate to the correct location

2. npm install - to install dependencies

3. env file, dockerfile and docker-compose.yml should all be provided for this project for ease of testing

## Running via Docker
1. To build please use: docker-compose up --build

2. To run the tests within the container please use: docker-compose run app npm test

3. To stop running the container use: docker-compose down

4. I did come across some caching issues which I was getting around with npm run build and docker-compose build --no-cache though I think I fixed it, but just incase it doesn't work for whatever reason you can try these.

## Running locally
1. Ensure that Postgres and Redis are running

2. Initialise the database: npm run migration:run

3. Build: npm run build

3. Start the development server: npm run dev

4. Run the tests: npm test

## API Documentation
The API consists of the following endpoints:

POST /tasks: Add a new task to the queue. Required fields: "title", "description"
GET /tasks: Retrieve all tasks
GET /tasks/:id: Retrieve a specific task
PUT /tasks/:id: Update a task's status. Required field: "status" (cannot be IN_PROGRESS)
DELETE /tasks/:id: Remove a task from the queue and database

## Submission Details
Technologies Used
Node.js
TypeScript
Express
BullMQ
Redis
Postgres
TypeORM
Jest
Docker

How BullMQ works in this project: 
1. When a new task is created via the API (POST /tasks), it is added to the BullMQ queue with its relevent data and saved to database

2. When it is next in the queue, it is picked up from processing by the worker. Its status gets updated in the database and it begins to be processed. In this POC, the processing simply is a console log saying it is processing. It is then marked as COMPLETED in the database (assuming it was successful). If, for whatever reason it was not successful, it would instead be marked as FAILED.

3. You can update the status of a task to PENDING and it will be re-added to the queue.
 (PUT /tasks/:id) OR you can mark it as COMPLETED or FAILED. You cannot update it to IN_PROGRESS as only the queue system can mark it as such

4. You can delete a task (DELETE /tasks/:id). If it's status is PENDING, it will also be removed from the queue. Else it will just be removed from the database. NOTE: We delete by jobname which is a flawed system as these are not necessarily unqiue. An improvement to this would be to store the BullMQ jobID that get's generated in the database and use this id to delete the job instead of name. I decided not to do this simply as a slight time save after realising the flaw.

Other notes:

I tried to not to exceed the time limit of 2.5 hours by too much so a couple of the requirements are missing, they will be discussed below.

The task service is all unit tested, utilising mocks to just test the logic. I did not end up doing integration tests simply because this was beginning to take too long but in a real project I would have done atleast a happy path integration test for each API route.

I used DI and IoC, both of which are technically a little overkill for a tech test of this scope but thought i'd include to showcase my understanding.

Didn't get round to a rate-limiter but I would just use something like express-rate-limiter to protect the service

Just used console.log for logging, If I were to spend more time I would add a proper logger like winston or equivalent.

Had not used BullMQ before and so this took some time to get to grips with

Did not do a repository layer due to the fact that TypeORM gives you it's own repository layer. If we needed more complex querying then it would have been a good idea but I thought it not worth in this case.

Did not do a FE due to time-limit, as it would simply be a SPA routing to these endpoints and displaying the text I didn't think it worth it as a showcase of skill






