riot.tag2('start-app', '<header>Welcome to the Steam LAN Assistant</header> <loader if="{isLoading}">Initializing LAN Assistant...</loader> <div class="game-listings" onclick="{showPlayerList}" each="{gameEntries}"> <div class="game-listings-filter"> {name} is owned by {players.length} players </div> <div class="player-listings" each="{id in players}"> {parent.namesMap[id]} </div> </div>', 'header { font-size: 24px; background: black; color: #fff; } .game-listings { background-color: #1b2838; border-radius: 5px; padding: .5rem; margin: .35rem; font-family: Arial, sans-serif; font-weight: bold; color: white; } .game-listings:hover { background-color: grey; cursor: pointer; } .game-listings-filter { background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%); width: 100%; height: 100%; } .player-listings { display: none; } .show-players .player-listings { display: block; }', '', function(opts) {
		this.gameEntries = [];

		this.isLoading = true;
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

		this.showPlayerList = function(event) {
			if( event.currentTarget.classList.contains('show-players') ) {
				event.currentTarget.classList.remove('show-players');
			} else {
				event.currentTarget.classList.add('show-players');
			}

		}.bind(this)
});