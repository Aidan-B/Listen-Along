$( document ).ready(function() {

let socket = io();

let urlParams = new URLSearchParams(window.location.search);
let roomId = urlParams.get('id');
let access_token = urlParams.get('access_token');
let refresh_token = urlParams.get('refresh_token');

$('#roomId').text(roomId);
$('#accessToken').text(access_token);
$('#refreshToken').text(refresh_token);


socket.on('refreshToken', (msg) => {
    $.ajax({
        url: '/refresh_token',
        data: {
            'refresh_token': refresh_token
        }
    }).done(function(data) {
        access_token = data.access_token;
        socket.emit('accessToken', {
            roomId: roomId,
            access_token: access_token,
            refresh_token: refresh_token
        });

        urlParams.set('access_token', access_token);
        $('#accessToken').text(access_token);

        if (msg.retry !== undefined) {
            msg.retry.data.retry = true;
            socket.emit(msg.retry.event, msg.retry.data);
        }
    });
    
    
}); 


socket.on('setup', () => {
    socket.emit('accessToken', {
        roomId: roomId,
        access_token: access_token,
        refresh_token: refresh_token
    });
});
$(window).bind('beforeunload', function(){
    socket.emit('beforeDisconnect', {
        roomId: roomId
    });
});




$('#play').click(function(){
    socket.emit('play', {
        roomId: roomId,
        access_token: access_token 
    })
});

$('#pause').click(function(){
    socket.emit('pause', {
        roomId: roomId,
        access_token: access_token 
    })
});

$('#getStatus').click(function() {
    socket.emit('getStatus', {
        roomId: roomId,
        access_token: access_token
    })
});

$('#addToQueue').click(function() {
    socket.emit('queueSong', {
        roomId: roomId,
        access_token: access_token,
        song_uri: 'spotify:track:2jz1bw1p0WQj0PDnVDP0uY'
    })
});

$('#seekTrack').click(function() {
    socket.emit('seekTrack', {
        roomId: roomId,
        access_token: access_token,
        position_ms: '60000'
    })
});




//Spotify API calls
$('#search').on("submit", function( event ) {
    //search requires q, type, limit, offset
    event.preventDefault();
    console.log('https://api.spotify.com/v1/search?' + $( this ).serialize());
    $.ajax({
        url: 'https://api.spotify.com/v1/search?' + $( this ).serialize(),
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        error: function (data, textStatus, xhr) {  
            console.error(data);  
        },
        success:  function (data, textStatus, xhr) {
            //TODO: this needs to change per query type. Only works for track seach right now
            
            console.log(data.tracks.items);
            let searchResults = $('#searchResults');
            searchResults.html('');
            
            //TODO: turn this into an item that can be added to queue
            data.tracks.items.forEach(element => {
                let artists = element.artists.map(e => e.name).join(", ");
                searchResults.append(JSON.stringify({
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