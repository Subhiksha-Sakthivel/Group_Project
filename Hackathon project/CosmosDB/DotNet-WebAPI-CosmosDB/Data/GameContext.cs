using DotNet_WebAPI_CosmosDB.Controllers;
using DotNet_WebAPI_CosmosDB.Models;
using Microsoft.EntityFrameworkCore;

namespace DotNet_WebAPI_CosmosDB.Data
{
	public class GameContext : DbContext
	{
		public GameContext(DbContextOptions options) : base(options)
		{

		}
		public DbSet<Game> Games { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.Entity<Game>()
				.ToContainer("Games")
				.HasPartitionKey(g => g.GameId);
		}
	}
}
