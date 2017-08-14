let async = require('async');
let _ = require('lodash');
let log = require('./my-logger');
let steamApi = require('./steam-web-api');

// TODO: get from user
let userSteamId = `76561198005327607`; // This is Sarophym's
// let userSteamId = `76561197996756453`; // This is Pat K's
let steamApiKey = `59A95A0F6EAE77FD106C2B5D83863A3D`;

let friendsNamesMap = {};
let maxSimultaneousRequests = 50;

module.exports = {
	start: start,
	getNamesMap: () => friendsNamesMap
};

function start() {
	// Get all friends
	console.info(`Retrieving friends list...`);
	return steamApi.init(steamApiKey)
		.then(steamApi.getFriendsList.bind(null, userSteamId))
		.then(getFriendsNamesAndGames)
		.then(transposeFriendAndGames)
		.then(retrieveGamesNames);
		//.then(printOutResults);
}

function getFriendsNamesAndGames(friendIds) {
	let friendToGamesMap = {};
	// Go get each ones game list
	let gamePromises = [];

	friendIds.forEach(id => {
		let gameListRequest = steamApi.getGamesList(id).then(games => friendToGamesMap[id] = games);
		let playerNameRequest = steamApi.getPlayerName(id).then(name => friendsNamesMap[id] = name);
		gamePromises.push(gameListRequest);
		gamePromises.push(playerNameRequest);
	});
	// Once we have every list in our map...
	console.info(`Retrieving friends' games lists...`);
	return Promise.all(gamePromises)
				.then(() => {
					return friendToGamesMap;
				});
}

function printOutResults(gameNameToFriendsList) {
	console.log(`
		New gameFrequencyMap is: 
			${displayGameCorrelations(gameNameToFriendsList)}
	`);
}

function retrieveGamesNames(gameToFriendsMap) {
	let arrayedFrequencies = _.toPairs(gameToFriendsMap);
	let p = new Promise((resolve, reject) => {
		console.info(`Retrieving games' names for ${_.keys(gameToFriendsMap).length} games...`);
		let retrievedNames = 0;
		async.mapLimit(arrayedFrequencies, maxSimultaneousRequests, function (gameFreq, callback) {
			steamApi.getGameName(gameFreq[0])
				.then(name => {
					console.log(`Got ${++retrievedNames} so far.`);
					callback(null, { name: name, id: gameFreq[0], players: gameFreq[1] });
				})

		}, function (err, gameNameToFriendsList) {
			if (err) {
				console.error(`Async errored: ${err}`);
				reject(err);
				return;
			}

			resolve(gameNameToFriendsList);
		});
	});

	return p;
}

function transposeFriendAndGames(friendToGamesMap) {
	let gameToFriendsMap = {};
	console.info(`Crunching games lists...`);
	for( let friendId in friendToGamesMap) {
		let friendsGameList = friendToGamesMap[friendId];
		friendsGameList.forEach(gameId => {
			gameToFriendsMap[gameId] = gameToFriendsMap[gameId] || [];
			gameToFriendsMap[gameId].push(friendId);
		});
	};

	return gameToFriendsMap;
}

/**
 * Consumes a list of objects with `name`, `id`, and `players` fields.
 * i.e. [{ "name": "first", "id": "124235436342", players": ["eric", "jeff"] },{ "name": "second", "id": "927362928454", "players": ["jeff", "ben", "eric"] }]
 */
function displayGameCorrelations(frequencyList) {
	let output = '';
	frequencyList = frequencyList.sort((a, b) => {
		return a.players.length - b.players.length;
	})

	frequencyList.forEach(game => {
		game.name = game.name || '**BAD NAME**';

		let playerNames = ``;
		game.players.forEach(playerId => {
			playerNames += `${friendsNamesMap[playerId]}, `;
		});

		output += `Game ${game.name.substr(0, 16)}(${game.id})\t\thas\t\t${game.players.length} players: ${playerNames}.
		`;
	});
	return output;
}