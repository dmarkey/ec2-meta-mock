
const http = require('http');
const cp = require('child_process');
const key = process.env.INPUT_KEY.toUpperCase();
process.chdir(__dirname)
if ( process.env[`STATE_${key}`] != undefined ) { // Are we in the 'post' step?
  http.get('http://169.254.169.254/shutdown/', (resp) => {
    let data = '';
  
    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });
  
    // The whole response has been received. Print out the result.
    resp.on('end', () => {
    });
  
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
} else { // Otherwise, this is the main step
  var child = cp.exec("nohup sudo -E node server.js > /dev/null 2>&1 &")
}
