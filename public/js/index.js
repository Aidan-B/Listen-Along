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
// var userProfileSource = document.getElementById('user-profile-template').innerHTML,
//     userProfileTemplate = Handlebars.compile(userProfileSource),
//     userProfilePlaceholder = document.getElementById('user-profile');

// var oauthSource = document.getElementById('oauth-template').innerHTML,
//     oauthTemplate = Handlebars.compile(oauthSource),
//     oauthPlaceholder = document.getElementById('oauth');

// var trackSource = document.getElementById('track-template').innerHTML,
//     trackTemplate = Handlebars.compile(trackSource),
//     trackContainer = $('#search-results');


// Validate auth
let urlParams = new URLSearchParams(window.location.search);
let access_token = urlParams.get('access_token');
let refresh_token = urlParams.get('refresh_token');
let error = urlParams.get('error');


// var params = getHashParams();

// var access_token = params.access_token,
//     refresh_token = params.refresh_token,
//     error = params.error;

if (error) {
    alert('There was an error during the authentication');
} else {
    if (access_token) {
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                $('#loggedin').show();
            }
        });

        $('#access_token').val(access_token);
        $('#refresh_token').val(refresh_token);

    } else {
        // jump to sign in page
        window.location.href = '/login';
    }


 /*   document.getElementById('obtain-new-token').addEventListener('click', function() {
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
*/
}