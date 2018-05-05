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
    localStorage.setItem("artist", $('#search-bar').val().toLowerCase().trim());  

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

    // Row clear fix
    clearRows630(w630);
    clearRows768(w768);
    clearRows992(w992); 
    clearRows1200(w1200);


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

            // If no artist info
            if (response.error) {
                $('#bottom-info').hide();
                $('#tour-info').hide();
                $('<p>No info found. Please check spelling and try again.</p>').appendTo('#artist-text');
            }
            else {
                var content = response.artist.bio.content;
                var summary = response.artist.bio.summary;
                if (content === "") {
                    $('#bottom-info').hide();
                    $('#tour-info').hide();
                    $('<p>No info found. Please check spelling and try again.</p>').appendTo('#artist-text');
                }
                else if (summary.match('Incorrect')){
                    $('#bottom-info').hide();
                    $('#tour-info').hide();
                    $('<p>No info found. Please check spelling and try again.</p>').appendTo('#artist-text');
                }
                else {
                    $('#bottom-info').show();
                    $('#tour-info').show();
                
                    //Image
                    var data = response.artist.image[3];
                    var image = $('<img>');
                    image.attr({src: data["#text"], id:"artist-img"});
                    $('#artist-pic').append(image);
                    
                    //Artist Name info
                    var name = response.artist.name;
                    $("#artist-header").html(name);   

                    //Bio Info
                    var info = response.artist.bio.summary;
                    $('#artist-text').append(info);
                    
                    //Display Similar Artist / count artists
                    var similarArtist = response.artist.similar.artist,
                        artistCount = 0;

                    if (similarArtist.length == 0) {
                        $('#related_header').hide();
                    }
                    else {
                    //Initialize similar Artist Div           
                        for (var i = 0; i < similarArtist.length; i++) {
                            if (artistCount < 5) {
                                var similarArtistLink = $('<a target="_blank" href="' + similarArtist[i].url + '">');
                                var similarArtistDiv = $('<div class="thumb-cont">');
                                $(similarArtistLink).append(similarArtistDiv);
                                $("#related-artists").append(similarArtistLink);

                                //Initialize artist Image
                                var similarArtistImage = $('<img>');
                                similarArtistImage.attr("src", similarArtist[i].image[3]["#text"]);
                                $(similarArtistDiv).append(similarArtistImage);

                                //Initialize Similar Artist Name
                                var similarArtistName = $('<h2>' + similarArtist[i].name + '</h2>');
                                $(similarArtistDiv).append(similarArtistName);

                                // Add clear fix class
                                artistCount++;
                                similarArtistDiv.addClass('clear'+artistCount);
                            }
                        } 
                    }
                }
            }
        });

    // Top Albums Last.fm API query
    $.ajax({
        url: queryTopAlbumsURL,
        method: "GET"})
        .done(function(albumResponse){
            
            //Initialize variables
            var topAlbums = albumResponse.topalbums.album;
            var albumCount = 0,
                releaseDate = '';

            //Grab Top Album Info
            for (var i = 0; i < topAlbums.length; i++) {
                if (albumCount < 5) {
                    // Get album name
                    var albumName = topAlbums[i].name;

                    var topAlbumsLink = $('<a target="_blank" href="' +topAlbums[i].url + '">');
                    var topAlbumsDiv = $('<div class="thumb-cont">');
                    $(topAlbumsLink).append(topAlbumsDiv);
                    $('#albums').append(topAlbumsLink);

                    //Inialize top albums Image
                    var topAlbumsImage = $('<img>');
                    topAlbumsImage.attr("src", topAlbums[i].image[3]["#text"]);
                    $(topAlbumsDiv).append(topAlbumsImage);

                    //Initialize Top Album Name
                    var topAlbumsName = $('<h2 id="albumName'+i+'">' + topAlbums[i].name + '</h2>');
                    $(topAlbumsDiv).append(topAlbumsName);

                    //Initialize Top Album Year
                    var year = $('<span id="albumYear'+i+'"></span>');
                    year.appendTo(topAlbumsDiv);

                    // Add clear fix class
                    albumCount++;
                    topAlbumsDiv.addClass('clear'+albumCount);
                }
            }
        });
    
    // Album year search & display
    setTimeout(albumYearSet, 200);
        function albumYearSet(){
            for (var i=0;i<5;i++) {
                (function (i) {
                        var album = $('#albumName'+i).text();
                        $.ajax({
                            url: 'https://musicbrainz.org/ws/2/release?query=' + album + '&fmt=json',
                            method: "GET"})
                            .done(function(infoResponse){
                                var rawDate = infoResponse.releases[0].date;
                                releaseDate = moment(rawDate).format('YYYY');
                                $('#albumYear'+i).text(releaseDate);
                            });
                })(i);
            }
        }
    
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

            //Empty response
            if (response == "") {
                $('<p>No tour dates found</p>').appendTo('#dates');
            }
        });

    var vidCount = '';
    // Music video IMVDb API query
    $.ajax({
        url:queryVideosURL, 
        method: 'GET', 
    })
        .done(function(response){

            var vidArtist = '',
                vidImage = '',
                vidTitle = '',
                vidURL = '',
                vidYear = null;


            // Store values in variables
            for (i=0;i<response.results.length;i++) {
                if (vidCount < response.results.length) {
                    vidArtist = response.results[i].artists[0].name;
                    if (vidArtist.toLowerCase() === localStorage.getItem('artist')) {
                        vidImage = response.results[i].image.l;
                        vidTitle = response.results[i].song_title;
                        vidURL = response.results[i].url;

                         //Show Video containers
                        $('#video_header').show();
                        $('#music-videos').show();

                        // Check if year exists
                        if (response.results[i].year !== null) {
                            vidYear = response.results[i].year;
                        }
                    
                        // Display videos
                        var videoDiv = $('<div class="thumb-cont">'),
                            vidLink = $('<a target="_blank" href="' + vidURL + '">');
                        
                        $(vidLink).append(videoDiv);
                        $('#music-videos').append(vidLink);
                        $('<img>').attr('src', vidImage).appendTo(videoDiv);
                        $('<h2>').text(vidTitle).appendTo(videoDiv);

                        if (vidYear !== null) {
                            $('<span>').text(vidYear).appendTo(videoDiv);
                        }

                        vidCount++;
                        // videoDiv.addClass('clear'+vidCount);

                    }
                }

            }
            if (vidCount == 0) {
                //Hide Containers
                $('#video_header').hide();
                $('#music-videos').hide();
            }
            
        });
    
    // Sort music videos
    setTimeout(function(){
        var links = $('#music-videos a');
        var numericallyOrderedDivs = links.sort(function (a, b) {
            return parseInt($(b).find('span').text().trim()) - parseInt($(a).find('span').text().trim());
        });
        $('#music-videos').html(numericallyOrderedDivs);

        for (i=0;i<vidCount;i++){
            // Add class for row clear fix
            $(numericallyOrderedDivs[i]).find('div').addClass('clear'+(i+1));
            // Row clear fix
            clearRows630(w630);
            clearRows768(w768);
            clearRows992(w992); 
            clearRows1200(w1200);
        }
    },500);
            
    // Empty search
    $('#search-bar').val(''); 


}

// Media queries

// Media query max-width: 480px (small screen fix)
function xxs(smFix) {
    if (smFix.matches) {
        $('#artist-pic').removeClass('col-xs-5').addClass('col-xs-12');
        $('#artist-info').removeClass('col-xs-7').addClass('col-xs-12');
    }
    else {
        $('#artist-pic').removeClass('col-xs-12').addClass('col-xs-5');
        $('#artist-info').removeClass('col-xs-12').addClass('col-xs-7');
    }
}
var smFix = window.matchMedia("(max-width: 480px)");
xxs(smFix);
smFix.addListener(xxs);


// Row clear fix
var w630 = window.matchMedia('(min-width: 630px)');
w630.addListener(clearRows630); 
function clearRows630(x) {
    clearRows(x, 2, 3); // >630px 2 per row, <630px 3 per row
}

var w768 = window.matchMedia('(min-width: 768px)');
w768.addListener(clearRows768); 
function clearRows768(x) {
    clearRows(x, 2, 2); // >768px 2 per row, <768px 2 per row
}

var w992 = window.matchMedia('(min-width: 992px)');
w992.addListener(clearRows992);
function clearRows992(x) {
    clearRows(x, 3, 2); // >992px 3 per row, <992px 2 per row
}

var w1200 = window.matchMedia('(min-width: 1200px)');
w1200.addListener(clearRows1200); 
function clearRows1200(x) {
    clearRows(x, 5, 3); // >1200px 5 per row, <1200px 3 per row
}

function clearRows(query, maxRow, minRow) {
    if (query.matches) {
        var clearCheckMax = function clearCheckMax() {
            for (x=1;x<=30;x++) {
                if (x % maxRow == 0){
                    var clearNum = '$("'+'.clear'+(x+1)+'")';
                    var check = eval(clearNum);
                    check.attr('style', 'clear:both');
                }
                else {
                    var noClear = '$("'+'.clear'+(x+1)+'")';
                    var noClearEval = eval(noClear);
                    noClearEval.removeAttr('style');
                }
            }
            clearInterval(checkIntMax);
        };
        var checkIntMax = setInterval(clearCheckMax, 200);
    }
    else {
        var clearCheckMin = function clearCheckMin() {
            for (x=1;x<=30;x++) {
                if (x % minRow == 0){
                    var clearNum = '$("'+'.clear'+(x+1)+'")';
                    var check = eval(clearNum);
                    check.attr('style', 'clear:both');
                }
                else {
                    var noClear = '$("'+'.clear'+(x+1)+'")';
                    var noClearEval = eval(noClear);
                    noClearEval.removeAttr('style');
                }
            }
            clearInterval(checkIntMin);
        };
        var checkIntMin = setInterval(clearCheckMin, 200);
    }
}



