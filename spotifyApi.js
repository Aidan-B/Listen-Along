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
        console.log(res.statusCode);
    });

    req.on('error', (error) => {
        console.error(error);
    })

    req.end();
}
