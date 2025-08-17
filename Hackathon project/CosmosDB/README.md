# .NET 8 Web API with Azure Cosmos DB using EF Core

This project demonstrates how to use Azure Cosmos DB in a .NET 8 Web API using Entity Framework Core.

## Project Structure

The project is structured into several classes:

- `Game`: This is the model class that represents a game.
- `GameContext`: This is the DbContext class that represents the session with the database. It allows querying and saving instances of the `Game` class.
- `IGamesRepo`: This is the interface that defines the contract for the repository.
- `GamesRepository`: This is the class that implements the `IGamesRepo` interface.
- `Program`: This is the main entry point for the application.

## Setup

To run this project, you need to have .NET 8 and Azure Cosmos DB.

1. Clone this repository.
2. Open the project in your favorite editor (e.g., Visual Studio, Visual Studio Code).
3. Update the `CosmosDB:URL` and `CosmosDB:AccessKey` in the `appsettings.json` file with your Azure Cosmos DB settings.
4. Run the project.

## Usage

The API exposes several endpoints that correspond to CRUD operations:

- `POST /api/games`: Create a new game.
  ```json
  {
      "GameId": "1",
      "Name": "Call of Duty: Warzone",
      "Description": "Call of Duty: Warzone was a free-to-play battle royale video game developed by Raven Software and Infinity Ward and published by Activision",
      "Type": "Shooter"
  }
- `GET /api/games/{id}`: Get a game by ID.
- `GET /api/games`: Get all games.
- `DELETE /api/games/{id}`: Delete a game by ID.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT

# TO ACCESS THE SWAGGER
http://localhost:5240/swagger/index.html
