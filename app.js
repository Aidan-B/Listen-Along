/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

let clientInfo = require("./clientInfo.json");

let access_token;
let refresh_token;


let client_id = clientInfo.client_id; // Your client id
let client_secret = clientInfo.client_secret; // Your secret
let redirect_uri = clientInfo.redirect_uri; // Your redirect uri

let roomId;
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8888;
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';



app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
		if (!error && response.statusCode === 200) {

			access_token = body.access_token;
			refresh_token = body.refresh_token;

			var options = {
				url: 'https://api.spotify.com/v1/me',
				headers: { 'Authorization': 'Bearer ' + access_token },
				json: true
			};

			// use the access token to access the Spotify Web API
			request.get(options, function(error, response, body) {
				console.log(body);
			});
			
			// we can also pass the token to the browser to make requests from there
			res.redirect('/#' +
				querystring.stringify({
					access_token: access_token,
					refresh_token: refresh_token
			}));
		} else {
			res.redirect('/' +
			querystring.stringify({
				error: 'invalid_token'
			}));
		}
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/room', function(req, res) {
  res.sendFile(__dirname + '/public/room.html')
  roomId = req.query.id;
});


http.listen(port, () => {
    console.log('listening on *:' + port);
});

io.on('connection', (socket)=> {

	socket.join(roomId);
	socket.emit('roomId', { "roomId": roomId } ); //Connect user to room
	let room = io.sockets.adapter.rooms;
	console.log(room);
	if (room[roomId].leader == undefined) {room[roomId].leader = socket.id}
	console.log('user with access token ' + access_token + ' and id ' + socket.id + ' connected to ' + roomId);

	io.to(roomId).emit('roomId', { "roomId" : roomId });

	// socket.on('message', (msg) => {
	// 	// console.log("restart", msg);
	// 	//io.to(roomId).emit('restart', { "roomId" : roomId });
	// });

	socket.on('disconnect', () => {
		console.log('user '+socket.id+' disconnected');
		if (room[roomId] != undefined) {console.log(room[roomId].length); }
	});

});