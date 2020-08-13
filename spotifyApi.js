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

module.exports.seekTrack = function (access_token, position_ms) {
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

module.exports.profile = async function (access_token) {
    return new Promise((resolve, reject) => {
        let data = "";
        let options = {
            hostname: 'api.spotify.com',
            path: '/v1/me',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        }
        const req = https.request(options, (res) => {
            console.log("profile:", res.statusCode);
            res.on('data', d => {
                data += d;
            })
            
            res.on('end', ()=> {
                if (res.statusCode === 200 ) {
                    resolve(JSON.parse(data));
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

module.exports.getStatusCode = function(status_code) {
    switch (status_code) {
        case 200:
            return "OK - The request has succeeded. The client can read the result of the request in the body and the headers of the response."
            break;
        case 201:
            return "Created - The request has been fulfilled and resulted in a new resource being created."
            break;
        case 202:
            return "Accepted - The request has been accepted for processing, but the processing has not been completed."
            break;
        case 204:
            return "No Content - The request has succeeded but returns no message body."
            break;
        case 304:
            return "Not Modified. See Conditional requests."
            break;
        case 400:
            return "Bad Request - The request could not be understood by the server due to malformed syntax. The message body will contain more information; see Response Schema."
            break;
        case 401:
            return "Unauthorized - The request requires user authentication or, if the request included authorization credentials, authorization has been refused for those credentials."
            break;
        case 403:
            return "Forbidden - The server understood the request, but is refusing to fulfill it."
            break;
        case 404:
            return "Not Found - The requested resource could not be found. This error can be due to a temporary or permanent condition."
            break;
        case 429:
            return "Too Many Requests - Rate limiting has been applied."
            break;
        case 500:
            return "Internal Server Error. You should never receive this error because our clever coders catch them all … but if you are unlucky enough to get one, please report it to us through a comment at the bottom of this page."
            break;
        case 502:
            return "Bad Gateway - The server was acting as a gateway or proxy and received an invalid response from the upstream server."
            break;
        case 503:
            return "Service Unavailable - The server is currently unable to handle the request due to a temporary condition which will be alleviated after some delay. You can choose to resend the request again."
            break;                                                                                                                            
        default:
            return "Unknown Status Code"
            break;
    }
}