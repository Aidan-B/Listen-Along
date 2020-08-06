$( document ).ready(function() {

console.log( "ready!" );
let socket = io();
let roomId;

// socket.on('ping', (msg) => {
//     console.log('ping', msg);
// });
socket.on('roomId', (msg) => {
    console.log('roomId', msg);
    roomId = msg.roomId;
    $('#roomId').text(roomId);
});



//Spotify API calls
$('#search').on( "submit", function( event ) {
    //search requires q, type, limit, offset
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
/*
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
*/

});