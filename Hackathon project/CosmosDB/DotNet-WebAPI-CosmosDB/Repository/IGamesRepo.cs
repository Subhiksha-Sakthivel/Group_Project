using DotNet_WebAPI_CosmosDB.Models;

namespace DotNet_WebAPI_CosmosDB.Repository
{
	public interface IGamesRepo
	{
		void CreateGame(Game game);
		Game GetGame(string Id);
		IEnumerable<Game> GetAllGames();
		void RemoveGame(string game);
	}
}
