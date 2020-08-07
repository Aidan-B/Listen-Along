const https = require('https');

module.exports.play = function (access_token) {
    let options = {
        hostname: 'api.spotify.com',
        path: '/v1/me/player/play',
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }
    const req = https.request(options, (res) => {
        console.log("play:", res.statusCode);
        res.on('data', d => {
            process.stdout.write(d)
        })
    });

    req.on('error', (error) => {
        console.error(error);
    })

    req.end();
}

module.exports.pause = function (access_token) {
    let options = {
        hostname: 'api.spotify.com',
        path: '/v1/me/player/pause',
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }
    const req = https.request(options, (res) => {
        console.log("pause:", res.statusCode);
        res.on('data', d => {
            process.stdout.write(d)
        })
    });

    req.on('error', (error) => {
        console.error(error);
    })

    req.end();
}

module.exports.getStatus = function (access_token) {
    let options = {
        hostname: 'api.spotify.com',
        path: '/v1/me/player/',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }
    const req = https.request(options, (res) => {
        console.log("getStatus:", res.statusCode);
        res.on('data', d => {
            process.stdout.write(d)
        })
    });

    req.on('error', (error) => {
        console.error(error);
    })

    req.end();
}

module.exports.queueSong = function (access_token, track_uri) {
    let options = {
        hostname: 'api.spotify.com',
        path: '/v1/me/player/queue?uri=' + track_uri,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    }
    const req = https.request(options, (res) => {
        console.log("queueSong:", res.statusCode);

        res.on('data', (data) => {
            console.log(data);
        });
    });

    req.on('error', (error) => {
        console.error(error);
    })

    req.end();
}