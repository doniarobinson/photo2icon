// Submission to Trunk Club by Donia Robinson
// Mashup of GettyImages API and Aylien Text Analysis API

// generates random word
var adjNoun = require('adj-noun');

// Node web server
var express = require('express');
var app = express();

// Getty API and credentials
var api = require("gettyimages-api");
var creds = {   apiKey: "snj7u7px56zqch2aqc559928", 
                apiSecret: "q2FzbYadmWy56XTFzU6bfWNZXSRSncgfx323FXc8GvTyZ"
            };
var client = new api (creds);

// Text analysis API and credentials
var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
  application_id: "f86aaf8c",
  application_key: "f129a578dea22e0f230f38cdb07d928f"
});

// Promise to return callback of request for hashtags generated from caption
function getTags(opts) {
  return new Promise((resolve, reject) => {
    textapi.hashtags(opts, function(errorT, responseT) {
      if (errorT === null) {
        var results = responseT['hashtags'] == "" ? ["none"] : responseT['hashtags'];
        //console.log(results);
        resolve(results);
      }
      else {
        reject('');
      }
    });
  });
}

app.get('/', function (req, res) {
  // Generate a random seed and get a random word
  adjNoun.seed(Math.floor(Math.random() * 10000));
  randWord = adjNoun()[0];

  // Search GettyImages API using the random word generated and setting several options per API documentation
  client.search().images().withExcludeNudity(true).withPage(1).withPageSize(1).withNumberOfPeople('none').withPhrase(randWord)
      .execute(function(err, response) {
        //
        var body = "";
          // If an image is successfully retrieved, proceed with more steps
          if (response.images.length>0)  {
            var caption = response.images[0].caption;
            var opts = { 'text': caption };

            // Send caption to text analysis API and return hashtags
            getTags(opts).then((tags) => {

              var location = response.images[0].display_sizes[0].uri;
              var url = location.split('?')[0];

              // Format random word, image, and caption for display
              body = "<h2><span style='color:aaaaaa;'>Random word generated by Node module</span>: " + randWord + "</h2><p><span style='color:red;'>Image (below) returned from Getty API:</span></p><img src='" + url + "' height='500px'><p><span style='color:red;'>Caption returned from Getty API: </span>" + caption + "</p>";

              // Format hashtags for display
              body+= "<p><span style='color:red;'>Hashtags generated by Aylien Text Analysis API from the Getty caption: </span>" + tags.join(' ') + "</p>";

              // Display the results!
              res.send(body);
            }).catch(function(e) {
              var location = response.images[0].display_sizes[0].uri;
              var url = location.split('?')[0];

              // Format random word, image, and caption for display
              body = "<h2><span style='color:aaaaaa;'>Random word generated by Node module</span>: " + randWord + "</h2><p><span style='color:red;'>Image (below) returned from Getty API:</span></p><img src='" + url + "' height='500px'><p><span style='color:red;'>Caption returned from Getty API: </span>" + caption + "</p>";

              // Promise failed, so gracefully write an error message
              body+= "<p><span style='color:red;'>Hashtags generated by Aylien Text Analysis API from the Getty caption: </span>None</p>";

              // Display the results!
              res.send(body);
            });
          }
          // Image could not be retrieved; print error message
          else {
            body = "<h2><strong>" + randWord + "</strong> is a little too unusual to find a picture for. Please refresh the page to try again.</h2>";
            res.send(body);
          }
      });
});

// Express server waiting to be asked to make an API call
var listener = app.listen(3000, function(){
    console.log('Listening on port ' + listener.address().port);
});