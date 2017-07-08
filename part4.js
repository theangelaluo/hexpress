"use strict";

var hexpress = require('./hexpress');
var app = hexpress();

// Simple route '/' should render the index.hbs file
// located in /hexpress/views. Should replace {{fname}}
// and {{lname}} with Prath and Desai respectively.
// Additionally it should list all artists listed in the
// favouriteArtists array
app.get('/', function(req, res) {
  res.render('./views/index.hbs', {
    fname: 'Pierre',
    lname: 'Trudeau',
    favouriteArtists: ['Taylor Swift', 'Seafret', 'The Killers', 'Bon Iver', 'Bob Dylan', 'Young the Giant']
  });
});

app.listen(3000);
