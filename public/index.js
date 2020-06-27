/**
 * Obtains parameters from the hash of the URL
 * @return Object
 */
function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}


// Setup Handlebars Templates
var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById('user-profile');

var oauthSource = document.getElementById('oauth-template').innerHTML,
    oauthTemplate = Handlebars.compile(oauthSource),
    oauthPlaceholder = document.getElementById('oauth');

var trackSource = document.getElementById('track-template').innerHTML,
    trackTemplate = Handlebars.compile(trackSource),
    trackContainer = $('#search-results');


// Validate auth
var params = getHashParams();

var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

if (error) {
    alert('There was an error during the authentication');
} else {
    if (access_token) {
        // render oauth info
        oauthPlaceholder.innerHTML = oauthTemplate({
            access_token: access_token,
            refresh_token: refresh_token
        });

        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                $('#loggedin').show();
            }
        });
    } else {
        // jump to sign in page
        window.location.href = '/login';
    }




    //Spotify API calls
    $('#search').on( "submit", function( event ) {
        event.preventDefault();
        console.log("search");
        $.ajax({
            url: 'https://api.spotify.com/v1/search?' + $( this ).serialize(),
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            error: function (data, textStatus, xhr) {  
                console.log(data);  
            },
            success:  function (data, textStatus, xhr) {
                $('#search-results').html("");
                
                data.tracks.items.forEach(element => {
                    let artists = element.artists.map(e => e.name).join(", ");
                    trackContainer.append(trackTemplate({
                    track_url: element.external_urls.spotify,
                    album_art: element.album.images[1].url,
                    track_name: element.name,
                    artist_name: artists,
                    spotify_uri: element.uri
                    }));
                });
                    
            } 
        });
    });

    document.getElementById('obtain-new-token').addEventListener('click', function() {
        $.ajax({
            url: '/refresh_token',
            data: {
            'refresh_token': refresh_token
            }
        }).done(function(data) {
            access_token = data.access_token;
            oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
            });
        });
    }, false);
    
    document.getElementById('play').addEventListener('click', function() {
        console.log("play");
        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/play',  
            type: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            error: function (data, textStatus, xhr) {  
                console.log(data);  
            } 
        });
    }, false);

    document.getElementById('pause').addEventListener('click', function() {
        console.log("pause");
        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/pause',  
            type: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            error: function (data, textStatus, xhr) {  
                console.log(data);  
            } 
        });
    }, false);

    document.getElementById('getStatus').addEventListener('click', function() {
        console.log("getStatus");
        $.ajax({
            url: 'https://api.spotify.com/v1/me/player',  
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            error: function (data, textStatus, xhr) {  
                console.log(data);  
            } 
        }).done(function(data) {
            console.log(data);
        });
    }, false);

    document.getElementById('addToQueue').addEventListener('click', function() {
        console.log("getStatus");
        $.ajax({
            //this uri here is a random song, make sure things match up when doing this
            url: 'https://api.spotify.com/v1/me/player/queue?uri=spotify:track:6L3VWDPDTQkQFkqvmpAUMU',  
            type: 'POST',                
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            error: function (data, textStatus, xhr) {  
                console.log(data);  
            } 
        }).done(function(data) {
            console.log(data);
        });
    }, false);
}
