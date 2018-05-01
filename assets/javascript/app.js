// On load
$(document).ready(function() {
    if (localStorage.getItem('artist') !== null) {
        displayArtist();
    }
});

// On click for GO button
$('#go-btn').on("click", function(event) {
    // Set search in localStorage
    localStorage.clear();
    localStorage.setItem("artist", $('#search-bar').val());  

    // Search for artist input
    displayArtist();
    });

// When enter key pressed, click go button
var search = $('#search-bar');
search.on("keyup", function(event) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13 && search.value !== '') {
      // Trigger the button element with a click
      document.getElementById("go-btn").click();
    }
  });

// Artist search
function displayArtist() {

    // Empty any old data
    $('#artist-pic').empty();
    $('#artist-header').empty();
    $('#artist-text').empty();
    $('#albums').empty();
    $('#music-videos').empty();
    $('#related-artists').empty();
    $('#dates').empty();


    var artist = localStorage.getItem('artist');

    // Query URLs for AJAX queries
    queryArtistURL = 'https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' + artist +'&api_key=73f4efa4a0115bf9b55ac3d5fffd0d18&format=json';
    queryTopAlbumsURL = 'https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=' + artist + '&limit=5&api_key=73f4efa4a0115bf9b55ac3d5fffd0d18&format=json';
    queryTourURL = 'https://rest.bandsintown.com/artists/'+artist+'/events?app_id=a64eec781e9652d71e23c47c5670dd39&format=json';
    queryVideosURL = 'https://imvdb.com/api/v1/search/videos?q=' + artist;

    // Last.fm API query for artist
    $.ajax({
        url: queryArtistURL,
        method: "GET"})
        .done(function(response){
            var data = response.artist.image[3];
            
            //Image
            var image = $('<img>');
            image.attr({src: data["#text"], id:"artist-img"});
            $('#artist-pic').append(image);
            
            //Artist Name info
            var name = response.artist.name;
            $("#artist-header").html(name);   

            //Bio Info
            var info = response.artist.bio.summary;
            $('#artist-text').append(info);
            
            //Display Similar Artist
            var similarArtist = response.artist.similar.artist;

            //Initialize similar Artist Div           
            for (var i = 0; i < similarArtist.length; i++) {
                var similarArtistLink = $('<a target="_blank" href="' + similarArtist[i].url + '">');
                var similarArtistDiv = $('<div class="thumb-cont">');
                $(similarArtistLink).append(similarArtistDiv);
                $("#related-artists").append(similarArtistLink);

                //Initialize artist Image
                var similarArtistImage = $('<img>');
                similarArtistImage.attr("src", similarArtist[i].image[2]["#text"]);
                $(similarArtistDiv).append(similarArtistImage);

                //Initialize Similar Artist Name
                var similarArtistName = $('<h2>' + similarArtist[i].name + '</h2>');
                $(similarArtistDiv).append(similarArtistName);
            } 
         
        });

    // Similar artists Last.fm API query
    $.ajax({
        url: queryTopAlbumsURL,
        method: "GET"})
        .done(function(albumResponse){
            
            //Initialize variable for Top Albums
            var topAlbums = albumResponse.topalbums.album;

            //Grab Top Album Info
            for (var i = 0; i < topAlbums.length; i++) {
                var topAlbumsLink = $('<a target="_blank" href="' +topAlbums[i].url + '">');
                var topAlbumsDiv = $('<div class="thumb-cont">');
                $(topAlbumsLink).append(topAlbumsDiv);
                $('#albums').append(topAlbumsLink);

                //Inialize top albums Image
                var topAlbumsImage = $('<img>');
                topAlbumsImage.attr("src", topAlbums[i].image[2]["#text"]);
                $(topAlbumsDiv).append(topAlbumsImage);

                //Initialize Top Album Name
                var topAlbumsName = $('<h2>' + topAlbums[i].name + '</h2>');
                $(topAlbumsDiv).append(topAlbumsName);
            }
        });
    
    // Tour dates Bandsintown API query
    $.ajax({url:queryTourURL, method: 'GET'})
        .done(function(response){
            for (i=0;i<response.length;i++) {
            var date = moment(response[i].datetime).format('MMMM Do, YYYY'),
                venue = response[i].venue.name,
                city = response[i].venue.city,
                state = response[i].venue.region,
                country = response[i].venue.country,
                offerArr = response[i].offers,
                sale = '';
            
            // Add offer link if available
            if (offerArr.length > 0) {
                sale = response[i].offers[0].url;
            }

            // Build date entry
            $('<h2>').addClass('date').append(date).appendTo('#dates');
            $('<span>').addClass('venue').append(venue+'<br>').appendTo('#dates');

            // Conditional appearance fix based on country
            if (country !== 'United States') {
                $('<span>').addClass('citystate').append(city + ', ' + country).appendTo('#dates');
            }
            else {
                $('<span>').addClass('citystate').append(city + ', ' + state).appendTo('#dates');
            }

            // Complete date entry build with ticket link
            $('<a>').addClass('link ticketlink'+i).attr('href', sale).appendTo('#dates');
            $('<p>').append('Tickets').appendTo('.ticketlink'+i);   
            }
        });

    // Music video IMVDb API query
    $.ajax({
        url:queryVideosURL, 
        method: 'GET', 
    })
        .done(function(response){
            console.log(response);

            var vidArtist = '',
                vidImage = '',
                vidTitle = '',
                vidURL = '',
                vidYear = null;

            // Store values in variables
            for (i=0;i<response.results.length;i++) {
                vidArtist = response.results[i].artists[0].name;
                if (vidArtist.toLowerCase() == localStorage.getItem('artist')) {
                    vidImage = response.results[i].image.l;
                    vidTitle = response.results[i].song_title;
                    vidURL = response.results[i].url;

                    // Check if year exists
                    if (response.results[i].year !== null) {
                        vidYear = response.results[i].year;
                    }
                
                    // Display videos
                    var videoDiv = $('<div class="thumb-cont">'),
                        vidLink = $('<a href="' + vidURL + '">');
                    
                    $(vidLink).append(videoDiv);
                    $('#music-videos').append(vidLink);

                    $('<img>').attr('src', vidImage).appendTo(videoDiv);
                    $('<h2>').text(vidTitle).appendTo(videoDiv);

                    if (vidYear !== null) {
                        $('<span>').text(vidYear).appendTo(videoDiv);
                    }
        
                }
            }
        });

            
    // Empty search
    $('#search-bar').val('');   
}

// Media query max-width: 480px
function xxs(x) {
    if (x.matches) {
        $('#artist-pic').removeClass('col-xs-5').addClass('col-xs-12');
        $('#artist-info').removeClass('col-xs-7').addClass('col-xs-12');
    }
    else {
        $('#artist-pic').removeClass('col-xs-12').addClass('col-xs-5');
        $('#artist-info').removeClass('col-xs-12').addClass('col-xs-7');
    }
}
var x = window.matchMedia("(max-width: 480px)");
xxs(x);
x.addListener(xxs);

