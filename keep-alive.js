var colors = require('colors'); // Console colors library
var request = require('request'); // Simplified HTTP client

const options = {
    url: 'https://grabify.link/GWDOXN',
    headers: {
      'User-Agent': 'Full hour'
    }
  };

function beat(){
    console.log(`Sending heartbeat to ${options.url}  |  ${new Date()}`.cyan );
    request(options); // Send a request to the given url with the given headers
}

function getTime(){
  return new Date().getMinutes()
}

if(getTime() >= 30){
  setTimeout(() => {  // Waits for it to be an exact hour (x:01)
      setInterval(function(){beat()}, 30 * 60 * 1000) // Calls beat() every 30 minutes
  }, (60 - getTime()) * 1000)
} else{
  setTimeout(() => {  // Waits for it to be an exact half hour (x:31)
      setInterval(function(){beat()}, 30 * 60 * 1000)  // Calls beat() every 30 minutes
  }, (30 - getTime()) * 1000)
}