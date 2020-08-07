$( document ).ready(function() {

console.log( "ready!" );
let socket = io();

let urlParams = new URLSearchParams(window.location.search);
let roomId = urlParams.get('id');
let access_token = urlParams.get('access_token');
let refresh_token = urlParams.get('refresh_token');

$('#roomId').text(roomId);
$('#accessToken').text(access_token);
$('#refreshToken').text(refresh_token);


$(window).unload(function(){
    socket.emit('beforeDisconnect', {
        roomId: roomId
    });
});

socket.on('roomId', (msg) => {
    console.log('roomId', msg);
    roomId = msg.roomId;
    $('#roomId').text(roomId);
});

socket.on('requestRoom', () => {
    socket.emit('accessToken', {
        roomId: roomId,
        access_token: access_token
    });
});




$('#play').click(function(){
    socket.emit('play', {
        roomId: roomId,
        access_token: access_token 
    })
});

$('#pause').click(function(){
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
});

$('#getStatus').click(function() {
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
});

$('#addToQueue').click(function() {
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










});