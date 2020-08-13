var express = require('express'); // Express web server framework
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var spotify = require('./spotifyApi');
const { settings } = require('cluster');
const { TIMEOUT } = require('dns');

let clientInfo = process.env
if (clientInfo.client_id == null || clientInfo.client_id == "") {
  clientInfo = require("./clientInfo.json");
}

let client_id = clientInfo.client_id; // Your client id
let client_secret = clientInfo.client_secret; // Your secret
let redirect_uri = clientInfo.redirect_uri; // Your redirect uri

let port = clientInfo.PORT;
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
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
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
        res.cookie("has_premium", (body.product === "premium"));
        
        res.redirect('/?' +
				querystring.stringify({
					access_token: access_token,
					refresh_token: refresh_token
			  }));
			});
			
			
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
    headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },
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
      res.send({error, response, body});      
    }
  });
});

app.get('/room', function(req, res) {
  var has_premium = req.cookies ? req.cookies["has_premium"] : null;
  if (has_premium === "true") {
    res.sendFile(__dirname + '/public/room.html')
    roomId = req.query.id;
  } else {    
    res.redirect('/');
  }
  
});

http.listen(port, () => {
    console.log('listening on *:' + port);
});


io.on('connection', (socket)=> {


  async function makeRequest(command, msg, id) {
    new Promise((resolve, reject) => {
      let updatePause = 250;
      //TODO: We have lots of timeouts here waiting for spotify to update the status of its api.
      //We should implement local versions of things, then update them after a longer timer as an error correction measure
      switch (command) {
        case "play":
          spotify.play(rooms[msg.roomId].accessTokens[id])
          .then(() => {
            setTimeout(() => {resolve()}, updatePause);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
          break;
      
        case "pause":
          spotify.pause(rooms[msg.roomId].accessTokens[id])
          .then(() => {
            setTimeout(() => {resolve()}, updatePause);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
          break;

        case "getStatus":
          spotify.getStatus(rooms[msg.roomId].accessTokens[id])
          .then((data) => {
            console.log(data);
            setTimeout(() => {resolve()}, updatePause);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
          break;
      
        case "queueSong":
          spotify.queueSong(rooms[msg.roomId].accessTokens[id], msg.song_uri)
          .then(() => {
            setTimeout(() => {resolve()}, updatePause);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
          break;
      
        case "seekTrack":
          spotify.seekTrack(rooms[msg.roomId].accessTokens[id], msg.position_ms)
          .then(() => {
            setTimeout(() => {resolve()}, updatePause);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
          break;
          
        case "next":
          spotify.next(rooms[msg.roomId].accessTokens[id])
          .then(() => {
            //TODO: implement a local queue, and increase this as an error check rather than a workaround
            setTimeout(() => {resolve()}, updatePause);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
          break;
        
        case "previous":
          spotify.previous(rooms[msg.roomId].accessTokens[id])
          .then(() => {
            //TODO: implement a local queue, and increase this as an error check rather than a workaround
            setTimeout(() => {resolve()}, updatePause);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
          break;
        
        case "start":
          spotify.start(rooms[msg.roomId].accessTokens[id])
          .then(() => {
            setTimeout(() => {resolve()}, updatePause);
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          });
          break;
        
        default:
          break;
      }
    }).then(() => {
      io.to(msg.roomId).emit('updateStatus');
    }).catch((error) => { 
      if (msg.retry != true) { onRequestError(error, command, id, msg); }
    });  
  }

  function onRequestError(error, action, id, msg) {
    io.to(id).emit('requestError', error);
    console.error(error.status, spotify.getStatusCode(error.status))
    if (error.status === 401 && error.message === "The access token expired") {
      io.to(id).emit('refreshToken', { 
        retry: {
          event: action,
          data: msg
        }
      });
    }
  }

  function assignNewLeader(oldId, roomId) {
    let newLeader = ( Object.keys(rooms[roomId].sockets)[0] == oldId ) ? Object.keys(rooms[roomId].sockets)[1] : Object.keys(rooms[roomId].sockets)[0];
    rooms[roomId].leader = newLeader;
    console.log(newLeader)
    io.to(oldId).emit('leader', false);
    io.to(newLeader).emit('leader', true);
  }


    
  let rooms = io.sockets.adapter.rooms;
	socket.emit('setup'); //Connect user to room
	
	socket.on('accessToken', (msg)=>{

		socket.join(msg.roomId);
		if (rooms[msg.roomId].accessTokens == undefined) {rooms[msg.roomId].accessTokens = {}}
		if (rooms[msg.roomId].refreshTokens == undefined) {rooms[msg.roomId].refreshTokens = {}}
		if (rooms[msg.roomId].leader == undefined) {
      io.to(socket.id).emit('leader', true);
      rooms[msg.roomId].leader = socket.id
      rooms[msg.roomId].settings = { controlPlayback: false }
    }
		rooms[msg.roomId].accessTokens[socket.id] = msg.access_token
		rooms[msg.roomId].refreshTokens[socket.id] = msg.refresh_token

    console.log('User ' + socket.id + ' connected to room ' + msg.roomId);
  })
  
  
  
  //Playback control
  socket.on('previous', (msg) => {
    console.log(`user ${socket.id} - previous:`, msg);
    if (socket.id !== rooms[msg.roomId].leader && !rooms[msg.roomId].settings.controlPlayback) {return}
    makeRequest("previous", msg, rooms[msg.roomId].leader)
	});

	socket.on('play', (msg) => {
    console.log(`user ${socket.id} - play:`, msg);
    if (socket.id !== rooms[msg.roomId].leader && !rooms[msg.roomId].settings.controlPlayback) {return}
    makeRequest("play", msg, rooms[msg.roomId].leader)		
	});

	socket.on('pause', (msg) => {
    console.log(`user ${socket.id} - pause:`, msg);
    if (socket.id !== rooms[msg.roomId].leader && !rooms[msg.roomId].settings.controlPlayback) {return}
    makeRequest("pause", msg, rooms[msg.roomId].leader)
  });
  
  socket.on('next', (msg) => {
    console.log(`user ${socket.id} - next:`, msg);
    if (socket.id !== rooms[msg.roomId].leader && !rooms[msg.roomId].settings.controlPlayback) {return}
    makeRequest("next", msg, rooms[msg.roomId].leader)
  });
  
  socket.on('seekTrack', (msg) => {
    console.log(`user ${socket.id} - seekTrack:`, msg);
    if (socket.id !== rooms[msg.roomId].leader && !rooms[msg.roomId].settings.controlPlayback) {return}
    makeRequest("seekTrack", msg, rooms[msg.roomId].leader)
  });

  socket.on('queueSong', (msg) => {
    console.log(`user ${socket.id} - queueSong:`, msg);
    if (socket.id !== rooms[msg.roomId].leader && !rooms[msg.roomId].settings.controlPlayback) {return}
    makeRequest("queueSong", msg, rooms[msg.roomId].leader)
  });



	socket.on('getStatus', (msg) => {
    console.log(`user ${socket.id} - getStatus:`, msg);
    if (socket.id !== rooms[msg.roomId].leader && !rooms[msg.roomId].settings.controlPlayback) {return}
    spotify.getStatus(msg.access_token)
      .then((data) => {
        console.log(data)
      }).catch((error) => {
        console.error(error);
      });
	});
  

  //Update settings across clients
  socket.on('settings', (msg) => {
    console.log(`user ${socket.id} - settings:`, msg);
    if (socket.id !== rooms[msg.roomId].leader) {return}
    rooms[msg.roomId].settings = msg.settings;
  
    io.to(msg.roomId).emit('updateSettings', rooms[msg.roomId].settings)
  });


  //Sync songs between clients based on leader
  socket.on('updateSong', (msg) => {
    console.log(`user ${socket.id} - updateSong`);
    if (socket.id !== rooms[msg.roomId].leader) {return}

    for (var id in rooms[msg.roomId].sockets) {
      if (id === rooms[msg.roomId].leader) {return} //No need to change leader's playback

      spotify.getStatus(rooms[msg.roomId].accessTokens[id])
      .then((data) => {

        if (data.item.uri !== msg.playerStatus.item.uri) {//not playing the same song as leader

          spotify.start(rooms[msg.roomId].accessTokens[id], msg.playerStatus.item.uri)
          .then(() => {
            spotify.seekTrack(rooms[msg.roomId].accessTokens[id], msg.playerStatus.progress_ms).catch((error) => {
              console.error(error)
            })
          }).catch((error) => {
            console.error(error)
          })
        }

        if (Math.abs(data.progress_ms - msg.playerStatus.item.progress_ms) > 5000) { //playback time descrepencey >5s from leader
          spotify.seekTrack(rooms[msg.roomId].accessTokens[id], msg.playerStatus.progress_ms)
          .catch((error) => {
            console.error(error)
          })
        }

      }).catch((error) => {
        console.error(error);
      });
    }
  });

  //Handle dissconection of users
	// socket.on('beforeDisconnect', (msg) => {
     //Do this on reload or similar
  // });
  socket.on('disconnecting', () => { //Disable from room if appropriate
    Object.keys(socket.rooms).forEach(element => {
      if (rooms[element].leader !== undefined && rooms[element].leader == socket.id) {
        assignNewLeader(socket.id, element);
      }
    });
  });
	socket.on('disconnect', () => {
		console.log('user ' + socket.id + ' disconnected');
    //console.log(socket);
	});

});
