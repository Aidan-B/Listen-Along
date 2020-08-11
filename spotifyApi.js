const https = require('https');

module.exports.play = async function (access_token) {
    return new Promise((resolve, reject) => {
        let data = "";
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
                data += d;
            })
            
            res.on('end', ()=> {
                if (res.statusCode === 204 ) {
                    resolve(true);
                }else {
                    reject(JSON.parse(data).error);
                }
                
            });
            
        });
        req.on('error', (error) => {
            reject(new Error(error));
        })
        req.end();
    })
}

module.exports.pause = function (access_token) {
    return new Promise((resolve, reject) => {
        let data = "";
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
                data += d;
            })
            
            res.on('end', async ()=> {
                if (res.statusCode === 204 ) {
                    resolve(true);
                }else {
                    reject(JSON.parse(data).error);
                }
            });
            
        });
        req.on('error', (error) => {
            reject(new Error(error));
        })
        req.end();
    })
}

module.exports.getStatus = function (access_token) {
    return new Promise((resolve, reject) => {
        let data = "";
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
                data += d;
            })
            
            res.on('end', async ()=> {
                if (res.statusCode === 200 ) {
                    resolve(JSON.parse(data));
                }else {
                    reject(JSON.parse(data));
                }
            });
            
        });
        req.on('error', (error) => {
            reject(new Error(error));
        })
        req.end();
    })
}

module.exports.queueSong = function (access_token, track_uri) {
    return new Promise((resolve, reject) => {
        let data = "";
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
            res.on('data', d => {
                data += d;
            })
            
            res.on('end', async ()=> {
                if (res.statusCode === 204 ) {
                    resolve(true);
                }else {
                    reject(JSON.parse(data).error);
                }
                
            });
            
        });
        req.on('error', (error) => {
            reject(new Error(error));
        })
        req.end();
    })
}

module.exports.seek = function (access_token, position_ms) {
    return new Promise((resolve, reject) => {
        let data = "";
        let options = {
            hostname: 'api.spotify.com',
            path: '/v1/me/player/seek?position_ms=' + position_ms,
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        }
        const req = https.request(options, (res) => {
            console.log("seek:", res.statusCode);
            res.on('data', d => {
                data += d;
            })
            
            res.on('end', async ()=> {
                if (res.statusCode === 204 ) {
                    resolve(true);
                }else {
                    reject(JSON.parse(data).error);
                }
                
            });
            
        });
        req.on('error', (error) => {
            reject(new Error(error));
        })
        req.end();
    })
}

module.exports.next = function (access_token) {
    return new Promise((resolve, reject) => {
        let data = "";
        let options = {
            hostname: 'api.spotify.com',
            path: '/v1/me/player/next' ,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        }
        const req = https.request(options, (res) => {
            console.log("next:", res.statusCode);
            res.on('data', d => {
                data += d;
            })
            
            res.on('end', async ()=> {
                if (res.statusCode === 204 ) {
                    resolve(true);
                } else {
                    reject(JSON.parse(data).error);
                }
                
            });
            
        });
        req.on('error', (error) => {
            reject(new Error(error));
        })
        req.end();
    });
}

module.exports.previous = function (access_token) {
    return new Promise((resolve, reject) => {
        let data = "";
        let options = {
            hostname: 'api.spotify.com',
            path: '/v1/me/player/previous' ,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        }
        const req = https.request(options, (res) => {
            console.log("previous:", res.statusCode);
            res.on('data', d => {
                data += d;
            })
            
            res.on('end', async ()=> {
                if (res.statusCode === 204 ) {
                    resolve(true);
                } else {
                    reject(JSON.parse(data).error);
                }
                
            });
            
        });
        req.on('error', (error) => {
            reject(new Error(error));
        })
        req.end();
    });
}

module.exports.start = async function (access_token, uri) {
    return new Promise((resolve, reject) => {
        const write = JSON.stringify({
            uris: [uri]
        });
        console.log(write)
        let data = "";
        let options = {
            hostname: 'api.spotify.com',
            path: '/v1/me/player/play',
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        }
        const req = https.request(options, (res) => {
            console.log("start:", res.statusCode);
            res.on('data', d => {
                data += d;
            })
            
            res.on('end', ()=> {
                if (res.statusCode === 204 ) {
                    resolve(true);
                }else {
                    reject(JSON.parse(data).error);
                }
                
            });
            
        });
        req.on('error', (error) => {
            reject(new Error(error));
        })

        req.write(write);
        req.end();
    })
}