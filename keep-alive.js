var colors = require('colors'); // Console colors library
var request = require('request'); // Simplified HTTP client

const options = {
    url: 'https://grabify.link/GWDOXN',
    headers: {
      'User-Agent': 'Test 1'
    }
  };
function beat(){
    console.log(`Sending heartbeat to ${options.url}`.cyan);
    request(options); // Send a request to the given url with the given headers
}
    
setInterval(beat,30 * 60 * 1000); // Run beat() every 30 minutes