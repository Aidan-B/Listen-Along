// Validate auth
let urlParams = new URLSearchParams(window.location.search);
let access_token = urlParams.get('access_token');
let refresh_token = urlParams.get('refresh_token');
let error = urlParams.get('error');

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
                console.log(response);
                if (response.product == "premium"){
                    $('#submit').prop("disabled", false);
                } else {
                    $('#loggedin').append(" You need to have a premium account to use this app.")
                }
                    
            }
        });
        
        $('#access_token').val(access_token);
        $('#refresh_token').val(refresh_token);

    } else {
        // jump to sign in page
        window.location.href = '/login';
    }
}
