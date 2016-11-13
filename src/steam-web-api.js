let request = require('request');
let _ = require('lodash');

module.exports = {
	getFriendsList: getFriendsList,
	getGamesList: getGamesList,
	getGameName: getGameName,
	getPlayerName, getPlayerName,
	getGameDetails: getGameDetails,
	init: init
}

let steamApiKey = null;
let inited = false;
let steamDomain = `http://api.steampowered.com`;
let steamStoreDomain = `http://store.steampowered.com`;
let steamVersion = `v0001`;

let steamInterfaces = {
	apps: 'ISteamApps',
	news: 'ISteamNews',
	stats: 'ISteamUserStats',
	users: 'ISteamUser',
	players: 'IPlayerService'
};

let steamMethods = {
	apps: { all: 'GetAppList' },
	users: { 
		friends: 'GetFriendList',
		summary: 'GetPlayerSummaries'
	},
	stats: { gameSchemas: 'GetSchemaForGame' },
	players: { ownedGames: 'GetOwnedGames' }
};

let gameNameMap = {};

function init(apiKey) {
	console.log('Initing...');
	steamApiKey = apiKey;
	return retrieveGameNameList()
		.then(() => {
			console.log('Inited.');
			inited = true;
		});
}

function getPlayerName(playerSteamId) {
	let playerSummaryEndpoint = `${steamDomain}/${steamInterfaces.users}/${steamMethods.users.summary}/${steamVersion}/?key=${steamApiKey}&steamids=${playerSteamId}`;

	let p = new Promise((resolve, reject) => {
		request(playerSummaryEndpoint, (err, resp, body) => {
			if( err ) {
				console.error(err);
				return;
			}

			let bodyObject = JSON.parse(body);
			let playerInfo = bodyObject.response.players.player[0];
			resolve(playerInfo.personaname);
		});
	});

	return p;
}

function getGameDetails(appId) {
	let gameDetailsEndpoint = `${steamStoreDomain}/api/appdetails?appids=${appId}`;

	let p = new Promise((resolve, reject) => {
		request(gameDetailsEndpoint, (error, resp, body) => {
			if (error) {
				console.error(error);
				return;
			}
			
			let details = JSON.parse(body)[appId];
			action = details.success === true ? resolve : reject;
			action(details);
		});
	});
	
	return p;
}

function retrieveGameNameList() {
	let gameNameMapEndpoint = `${steamDomain}/${steamInterfaces.apps}/${steamMethods.apps.all}/${steamVersion}`;
	let p = new Promise((resolve, reject) => {
		request(gameNameMapEndpoint, (error, resp, body) => {
			if (error) {
				console.error(error);
				return;
			}
			console.log('Game name response: ' + body);
			let bodyObject = JSON.parse(body);
			gameNameMap = _.fromPairs(_.map(bodyObject.applist.apps.app, _.values));
			resolve(gameNameMap);
		});
	});
	return p;
}

function getFriendsList(userSteamId) {
	let getFriendsUrl = `${steamDomain}/${steamInterfaces.users}/${steamMethods.users.friends}/${steamVersion}/?key=${steamApiKey}&steamid=${userSteamId}&relationship=friend`;
	let p = new Promise((resolve, reject) => {
		let friendsIds = [];

		request(getFriendsUrl, (error, resp, body) => {
			if (error) reject(error);
			let bodyObject = JSON.parse(body);
			bodyObject.friendslist.friends.forEach(friend => {
				friendsIds.push(friend.steamid);
			});

			resolve(friendsIds);
		});
	});
	return p;
}

function getGamesList(id) {
	let getOwnedGamesEndpoint = `${steamDomain}/${steamInterfaces.players}/${steamMethods.players.ownedGames}/${steamVersion}/?key=${steamApiKey}&steamid=${id}&format=json`;

	let gameIds = [];
	let p = new Promise((resolve, reject) => {
		request(getOwnedGamesEndpoint, (error, resp, body) => {
			let bodyObject = JSON.parse(body);
			bodyObject.response.games = bodyObject.response.games || [];
			bodyObject.response.games.forEach(game => {
				gameIds.push(game.appid);
			});

			resolve(gameIds);
		});
	});

	return p;
}

function getGameName(appId) {
	return Promise.resolve(gameNameMap[appId]);
}
