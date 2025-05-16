# Rick and Morty API

## Description

This project is a NestJS application that provides a GraphQL API for accessing Rick and Morty data. It integrates with the official Rick and Morty API, caches data in Redis for improved performance, and stores information in a PostgreSQL database. The application includes features for searching characters, locations, and episodes from the show.

## Features

- **GraphQL API**: Intuitive API for querying Rick and Morty data
- **Data Integration**: Syncs with the official Rick and Morty API
- **Caching**: Redis-based caching for optimized performance
- **Database Storage**: Persistent data storage in PostgreSQL
- **Scheduled Tasks**: Automated data synchronization and updates

## Technologies

- **Backend Framework**: NestJS
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis with Cache Manager
- **HTTP Client**: Axios for API requests
- **Container Platform**: Docker and Docker Compose
- **Language**: TypeScript

## Installation

### Prerequisites

- Docker and Docker Compose
- Node.js (v16+)
- npm or yarn

### Setup Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/rick-and-morty-ws.git
   cd rick-and-morty-ws
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Docker containers for PostgreSQL and Redis:

   ```bash
   docker-compose up -d
   ```

4. Run database migrations (if any):

   ```bash
   npm run sequelize -- db:migrate
   ```

5. Start the application:

   ```bash
   # Development mode
   npm run start:dev
   ```

### GraphQL Playground

Once the application is running, you can access the GraphQL playground at:

```
http://localhost:3000/graphql
```

#### Get Characters

```graphql
query CharactersByFilters {
  charactersByFilters(
    filters: {
      name: "Rick"
      status: "Alive"
      species: "Human"
      type: "Superhuman (Ghost trains summoner)"
      gender: "Male"
      origin: "Abadango"
    }
  ) {
    id
    name
    status
    species
    type
    gender
    image
    url
    created
    origin {
      id
      name
      type
      dimension
    }
    location {
      id
      name
      type
      dimension
    }
    episodes {
      id
      name
      air_date
      episode
    }
  }
}
```

#### Postman Collection

You can find the Postman collection for testing the API in the repository. Import the collection into Postman to test various endpoints.
