<start-app>
	<header>Steam LAN Assist</header>
	<form onsubmit={ init }>
		<label for="steam-id">
			Steam Id 
			<span class="fa-stack">
				<i class="fa fa-circle fa-stack-1x"></i>
				<i class="fa fa-info fa-stack-1x"></i>
			</span>
		</label>
		<input type="text" name="steam-id"/>
	</form>

	<!-- <loader if={ isLoading }>Initializing LAN Assistant...</loader> -->

	<div class="game-listings" onclick={ showPlayerList } each={ gameEntries }>
		<div class="game-listings-filter">
			{ name } is owned by {players.length} players
		</div>
		<div class="player-listings" each={ id in players }>
			{ parent.namesMap[id] }
		</div>
	</div>

	<script>
		this.gameEntries = [];
		
		this.isLoading = true;
		
		init() {
			this.opts.lanApp.start()
				.then( gameNameToFriendsList => {
					this.namesMap = this.opts.lanApp.getNamesMap();
					this.isLoading = false;
					this.gameEntries = gameNameToFriendsList;
					this.gameEntries.sort( (a, b) => {
						return b.players.length - a.players.length;
					});
					this.update();
				});
		}

		showPlayerList(event) {
			if( event.currentTarget.classList.contains('show-players') ) {
				event.currentTarget.classList.remove('show-players');
			} else {
				event.currentTarget.classList.add('show-players');
			}
			
		}
	</script>

	<style :scoped type="scss">
		header {
			font-size: 24px;
			background: #111;
			color: #fff;
		}
		
		form {
			.fa-circle {
				color: #68D286;
			}
			.fa-info {
				color: #fff;
			}
		}

		.game-listings {
			background-color: #1b2838;
			border-radius: 5px;
			padding: .5rem;
			margin: .35rem;
			font-family: Arial, sans-serif;
			font-weight: bold;
			color: white;
		}
		
		.game-listings:hover {
			background-color: grey;
			cursor: pointer;
		}
		
		.game-listings-filter {
			background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
			width: 100%;
			height: 100%;
		}
		
		.player-listings {
			display: none;
		}
		
		.show-players .player-listings {
			display: block;
		}
	</style>
</start-app>