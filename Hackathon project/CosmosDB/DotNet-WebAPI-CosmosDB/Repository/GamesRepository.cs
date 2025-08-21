using DotNet_WebAPI_CosmosDB.Data;
using DotNet_WebAPI_CosmosDB.Models;

namespace DotNet_WebAPI_CosmosDB.Repository
{
	public class GamesRepository : IGamesRepo
	{
		GameContext _context;
		public GamesRepository(GameContext context) 
		{
			_context = context;
		}

		void IGamesRepo.CreateGame(Game game)
		{
			_context.Add(game);
			_context.SaveChanges();
			
		}

		IEnumerable<Game> IGamesRepo.GetAllGames()
		{
			return _context.Games;
		}

		Game IGamesRepo.GetGame(string Id)
		{
			var Game = _context.Games.FirstOrDefault(x => x.GameId == Id);
			return Game;
		}

		void IGamesRepo.RemoveGame(string GameId)
		{
			var game = _context.Games.FirstOrDefault(x => x.GameId == GameId);
			_context.Remove(game);
			_context.SaveChanges(true);
		}
	}
}
