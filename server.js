var express = require('express');
var request = require('request');

var app = express();
var latestSearches = [];
var NUM_SEARCHES_TO_KEEP = 10;

app.use(express.static(__dirname));

app.get('/', function(req, res) {
	res.sendFile('index.html');
});

app.get('/latest/imagesearch', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(latestSearches));
});

app.get('/imagesearch/:query', function(req, res) {
	// req.query.offset
	var googleSearchURI = "https://www.googleapis.com/customsearch/v1?" +
		"key=AIzaSyDeZk63Og-et3pJH4BNvErKTPtB6WYweGI&" +
		"cx=012495914378195016189:tegkebz_fkc&" +
		"q=" + encodeURIComponent(req.params.query);

	if(req.query.offset && !isNaN(req.query.offset))
		googleSearchURI += "&num=" + req.query.offset;

	request(googleSearchURI, function(err, response, body) {
		res.setHeader('Content-Type', 'application/json');

		if(err)
			res.end(JSON.stringify(err));
		else {
			var results = JSON.parse(body).items.map(function(val, index, arr) {
				return {
					url : val.pagemap.cse_image ? val.pagemap.cse_image[0].src : 
						val.pagemap.metatags[0]["os:image"] || "No Image URL",
					snippet : val.snippet,
					thumbnail : val.pagemap.cse_thumbnail ? val.pagemap.cse_thumbnail[0].src : 
						"No Thumbnail URL",
					context : val.link
				}
			});

			res.end(JSON.stringify(results));
		}
	});

	latestSearches.unshift({
		term : req.params.query,
		when : new Date().toISOString()
	});
	latestSearches.splice(NUM_SEARCHES_TO_KEEP, 1);
});

app.listen(process.env.PORT || 8000, function() {
	console.log("Connection established");
});