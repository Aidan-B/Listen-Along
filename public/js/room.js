$( document ).ready(function() {

let socket = io();

let urlParams = new URLSearchParams(window.location.search);
let roomId = urlParams.get('id');
let access_token = urlParams.get('access_token');
let refresh_token = urlParams.get('refresh_token');
let leader = false //Assume that you aren't the leader unless the server says otherwise
let settings = {
    controlPlayback: false
}
let buttonsEnabled = false;

$('#roomId').text(roomId);
// $('#accessToken').text(access_token);
// $('#refreshToken').text(refresh_token);

if (access_token === null || refresh_token === null) {
    $(location).attr('href', '/')
}

socket.on('refreshToken', (msg) => {
    console.log("refreshing old token")   
    $.ajax({
        url: '/refresh_token',
        data: {
            'refresh_token': refresh_token
        }
    }).done(function(data) {
        console.log(data.access_token);
        access_token = data.access_token;
        socket.emit('accessToken', {
            roomId: roomId,
            access_token: access_token,
            refresh_token: refresh_token
        });

        if (msg.retry !== undefined) {
            msg.retry.data.retry = true;
            socket.emit(msg.retry.event, msg.retry.data);
        }

        urlParams.set('access_token', access_token);
        console.log(window.location + "?" + urlParams.toString());
        window.location.replace(window.location + "?" + urlParams.toString());
    });
});

socket.on('leader', (msg) => {
    //TODO: Ensure that the settings are correct when leadership is handed off to a different user
    leader = msg;
    if (leader) {
        enableButtons();
        $('#leader-settings').on("submit", function( event ) {
            //search requires q, type, limit, offset
            event.preventDefault();
            let controlPlayback = $('#controlPlayback').is(':checked');
            socket.emit('settings', {
                roomId: roomId,
                settings: {
                    controlPlayback: controlPlayback
                }
            })
        });
        $(".leader-settings").css('visibility', 'visible')
    } else if (settings.controlPlayback) {
        enableButtons();
        $(".leader-settings").css('visibility', 'hidden')
    } else {
        disableButtons();
        $(".leader-settings").css('visibility', 'hidden')
    }
});

socket.on('updateSettings', (msg) => {
    settings = msg
    if (settings.controlPlayback) {
        enableButtons();
    } else if (!leader) {
        disableButtons();
    }
});
socket.on('updateUsers', (msg) => {
    $('#activeUsers').html(`Users: ${msg.join(", ")}`);
})


socket.on('setup', () => {
    socket.emit('accessToken', {
        roomId: roomId,
        access_token: access_token,
        refresh_token: refresh_token
    });
});

socket.on('updateStatus', () => { 
    updateStatus() 
});
socket.on('requestError', (error) => {
    console.error(error);
})

// $(window).bind('beforeunload', function(){
//     socket.emit('beforeDisconnect', {
//         roomId: roomId
//     });
// });

function disableButtons() {
    if (!buttonsEnabled) {
        return;
    }
    buttonsEnabled = false;
    $('#previous').off('click');
    $('#play').off('click');
    $('#pause').off('click');
    $('#next').off('click');
    $('#getStatus').off('click');
    $('#progressBar').off('click');
    $('#searchButton').off("submit"); 

    $('#previous').prop('disabled', true);
    $('#play').prop('disabled', true);
    $('#pause').prop('disabled', true);
    $('#next').prop('disabled', true);
    $('#searchButton').prop('disabled', true);
}


function enableButtons() {
    if (buttonsEnabled) {
        return;
    }
    buttonsEnabled = true;
    $('#previous').prop('disabled', false);
    $('#play').prop('disabled', false);
    $('#pause').prop('disabled', false);
    $('#next').prop('disabled', false);
    $('#searchButton').prop('disabled', false);

    $('#previous').click(function(){
        val = 0;
        socket.emit('previous', {
            roomId: roomId,
            access_token: access_token 
        })
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
    
    $('#next').click(function(){
        val = 0;
        socket.emit('next', {
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
    
    $('#progressBar').click(function(e) {
        let progress = (e.pageX - $(this).position().left) / $(this).width();
        val = Math.floor(progress * max)
        if (val > max - 100) { //if you click the end of the track we actually want to go to the next track
            val = 0;
            socket.emit('next', {
                roomId: roomId,
                access_token: access_token 
            });
        } else {
            if (val < 0) {val = 1;}

            socket.emit('seekTrack', {
                roomId: roomId,
                access_token: access_token,
                progress_ms: val
            })
        }
    });

    //Spotify API calls
    $('#search').on("submit", function( event ) {
        //search requires q, type, limit, offset
        event.preventDefault();
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
                
                let searchResults = $('#searchResults');
                searchResults.html('');
                
                //TODO: turn this into an item that can be added to queue
                data.tracks.items.forEach(element => {
                    let artists = element.artists.map(e => e.name).join(", ");
                    searchResults.append(
                        cardTemplate(element.uri, element.album.images[2].url, element.name, artists)                
                    );
                });
                $('a.song-link').on('click', function(event) {
                    let uri = $(this).data('uri');
                    socket.emit('queueSong', {
                        roomId: roomId,
                        access_token: access_token,
                        song_uri: uri
                    });
                    searchResults.html('Song added');
                });
            } 
        });
    });
}



function getPlayerStatus() {
    return $.ajax({
        url: 'https://api.spotify.com/v1/me/player/',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        error: function (data, textStatus, xhr) {  
            console.error(data);  
        },
        success: function (data, textStatus, xhr) {
            return data;
        }
    })
}

function incrementProgress() {
    val += 1000;
    $('#progressBar').val(val);
    if (val >= max) { updateStatus() }
};
function updateStatus() {
    getPlayerStatus().then((data) => {
        console.log(data)
        max = data.item.duration_ms;
        val = data.progress_ms;
        $('#progressBar').prop('max', max);
        if (leader) {
            socket.emit('updateSong', {
                roomId: roomId,
                playerStatus: data
            });
        } 
        window.clearInterval(incrementInterval);
        if (data.is_playing)
            incrementInterval = window.setInterval(incrementProgress, 1000);

        let artists = data.item.artists.map(e => e.name).join(", ");
        $('#current-song').html(
            playbackTemplate(data.item.album.images[1].url, data.item.name, artists)                
        );
    });
}
let val = 0;
let max = 10000;
updateStatus();
let incrementInterval = window.setInterval(incrementProgress, 1000); //increment progress every 1 second

window.setInterval(updateStatus, 5000); //refresh progress every 5 seconds to ensure we are in sync with spotify

});

function cardTemplate(uri, album, name, artists) {
return `<div class="col mb-4">
    <div class="card" >
        <a href="#" class="song-link" data-uri="${uri}">
            <img src="${album}"></img>
            <span>${name} - ${artists}</span>
        </a>
    </div>
</div>`;
}

function playbackTemplate(album, name, artists) {
return `<div class="col">
    <img src="${album}"></img>
    <p>${name} - ${artists}</p>
</div>`;
}
    
