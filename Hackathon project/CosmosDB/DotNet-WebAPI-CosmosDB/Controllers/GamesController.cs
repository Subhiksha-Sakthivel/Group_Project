using DotNet_WebAPI_CosmosDB.Models;
using DotNet_WebAPI_CosmosDB.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DotNet_WebAPI_CosmosDB.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class GamesController : ControllerBase
	{
		private IGamesRepo _repo;
		public GamesController(IGamesRepo repo)
		{
			_repo = repo;
		}
		[HttpPost]
		public ActionResult AddGame(Game game)
		{
			_repo.CreateGame(game);
			return Ok(game);
		}
		[HttpGet("{Id}")]
		public ActionResult GetGame(string Id)
		{
			var Game = _repo.GetGame(Id);
			return Ok(Game);
		}

		[HttpGet]
		public ActionResult<IEnumerable<Game>> GetAllGame()
		{
			var Game = _repo.GetAllGames();
			return Ok(Game);
		}
		[HttpDelete]
		public ActionResult RemoveGame(string GameId)
		{
			_repo.RemoveGame(GameId);
			return Ok();
		}
	}
}
