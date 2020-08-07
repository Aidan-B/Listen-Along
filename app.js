var express = require('express'); // Express web server framework
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var spotify = require('./spotifyApi');

let clientInfo = require("./clientInfo.json");


let client_id = clientInfo.client_id; // Your client id
let client_secret = clientInfo.client_secret; // Your secret
let redirect_uri = clientInfo.redirect_uri; // Your redirect uri

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

			let access_token = body.access_token;
			let refresh_token = body.refresh_token;

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
			res.redirect('/?' +
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
    } else {
      //{ error: 'invalid_grant', error_description: 'Invalid refresh token' }
      res.send(body);      
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


//Expired tokens:
//Your access_token=BQCglLT7NeMF_gY-Pex7KlDu3OqoTw4xAqLCTBf7yuueh6msbR5gN9VMG6MXYEczHjkUaI7OdkJ0XGlLkYh8Wm68s_5exUFqpbiFFUOZvWfcc5UrAmwtj4upvq4Ci0l5tSHYeBdLY64USt0ffFpmvogLM9_VIGwC5suOQCEq&refresh_token=AQAphtf_IyDhpejQT150a1IjCQVhRbx0sTpgiDYYRYUpeCai_N6W9EatwoXv5srxMmPSx6XDx99-v2rC0ja4Yg_qD3M2PfiGKSKnYpYcRVaIC-jZ-rsG-AYy1Uz40gI2gIs




io.on('connection', (socket)=> {

  
  let rooms = io.sockets.adapter.rooms;
	socket.emit('setup'); //Connect user to room
	
	socket.on('accessToken', (msg)=>{

		socket.join(msg.roomId);
		if (rooms[msg.roomId].accessTokens == undefined) {rooms[msg.roomId].accessTokens = {}}
		if (rooms[msg.roomId].refreshTokens == undefined) {rooms[msg.roomId].refreshTokens = {}}
		if (rooms[msg.roomId].leader == undefined) {rooms[msg.roomId].leader = socket.id}
		rooms[msg.roomId].accessTokens[socket.id] = msg.access_token
		rooms[msg.roomId].refreshTokens[socket.id] = msg.refresh_token

		console.log('User ' + socket.id + ' connected to room ' + msg.roomId + ' and has access token \n' + msg.access_token);
	})
	
	socket.on('play', (msg) => {
    console.log("play", msg);
    if (msg.retry !== true){
      for (var id in rooms[msg.roomId].sockets) {
      
        spotify.play(rooms[msg.roomId].accessTokens[id])
        .catch((error) => {
          
          if (error.status === 401 && error.message === "The access token expired") {
            io.to(id).emit('refreshToken', { 
              retry: {
                event: "play",
                data: msg
              }
            });
          }
          console.error(error);
        });
      }
    } else {
      //only retry for failed user
      spotify.play(rooms[msg.roomId].accessTokens[socket.id])
      .catch((error) => {
        console.error(error);
      })
    }
		
	});

	socket.on('pause', (msg) => {
		console.log("pause", msg);
		if (msg.retry !== true){
      for (var id in rooms[msg.roomId].sockets) {
      
        spotify.pause(rooms[msg.roomId].accessTokens[id])
        .catch((error) => {
          
          if (error.status  === 401 && error.message == "The access token expired") {
            io.to(id).emit('refreshToken', { 
              retry: {
                event: "pause",
                data: msg
              }
            });
          }
          console.error(error);
        });
      }
    } else {
      //only retry for failed user
      spotify.pause(rooms[msg.roomId].accessTokens[socket.id])
      .catch((error) => {
        console.error(error);
      })
    }
	});

	socket.on('getStatus', (msg) => {
		console.log("getStatus", msg);
    spotify.getStatus(msg.access_token)
      .then((data) => {
        console.log(data)
      }).catch((error) => {
        console.error(error);
      });
	});

	socket.on('queueSong', (msg) => {
    console.log("queueSong", msg);
    if (msg.retry !== true){
      for (var id in rooms[msg.roomId].sockets) {
      
        spotify.queueSong(rooms[msg.roomId].accessTokens[id], msg.song_uri)
        .catch((error) => {
          
          if (error.status  === 401 && error.message == "The access token expired") {
            io.to(id).emit('refreshToken', { 
              retry: {
                event: "queueSong",
                data: msg
              }
            });
          }
          console.error(error);
        });
      }
    } else {
      //only retry for failed user
      spotify.queueSong(rooms[msg.roomId].accessTokens[socket.id], msg.song_uri)
      .catch((error) => {
        console.error(error);
      })
    }
  });
  
  //TODO: sync song progress across clients
  socket.on('seekTrack', (msg) => {
    console.log("seekTrack", msg);
    if (msg.retry !== true){
      for (var id in rooms[msg.roomId].sockets) {
      
        spotify.seek(rooms[msg.roomId].accessTokens[id], msg.position_ms)
        .catch((error) => {
          
          if (error.status  === 401 && error.message == "The access token expired") {
            io.to(id).emit('refreshToken', { 
              retry: {
                event: "seekTrack",
                data: msg
              }
            });
          }
          console.error(error);
        });
      }
    } else {
      //only retry for failed user
      spotify.seek(rooms[msg.roomId].accessTokens[socket.id], msg.position_ms)
      .catch((error) => {
        console.error(error);
      })
    }
  });

	socket.on('beforeDisconnect', (msg) => {
		console.log("about to disconnect")
	});
	socket.on('disconnect', () => {
		console.log('user disconnected', socket.id);

		//TODO: remove from room, and disable leader if appropriate
	});

});