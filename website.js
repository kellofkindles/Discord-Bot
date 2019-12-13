var colors = require('colors'); // Console colors library
const express = require('express'); // Website library
const app = express(); // Start express
const port = 3000; // Start express on specifc port
function website(){

app.use(express.static('public')) // Set public directory as website

app.listen(port, () => console.log(`Website hosted on port ${port}!`.blue))

}

module.exports = website; // Export website()