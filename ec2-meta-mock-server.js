
// Import the HTTP module
const http = require("http");
// Import the URL module
const url = require("url");
const os = require("os");

const userInfo = os.userInfo();
const cp = require('child_process');

// get uid property
// from the userInfo object
if (userInfo.uid != 0){
    console.log("Must be ran as root");
    process.exit(1)
}

if (process.platform == "darwin"){
    cp.execSync("ifconfig lo0 alias 169.254.169.254 255.255.255.255;")
} else if (process.platform == "linux"){
    cp.execSync("ip a add 169.254.169.254/32 dev lo;")
} else {
    console.log("Sorry, " + process.platform + " is not supported")
    process.exit(1)
}

function shutdown(){
    console.log('Shutdown received...');
    server.close();
    if (process.platform == "darwin"){
        cp.execSync("ifconfig lo0 delete 169.254.169.254 255.255.255.255;")
    } else if (process.platform == "linux"){
        cp.execSync("ip a del 169.254.169.254/32 dev lo;")
    }
}

process.once('SIGTERM', function (code) {
    shutdown()
});

var creds = {
    "Code" : "Success",
    "LastUpdated" : "1970-00-00T00:00:01Z",
    "Type" : "AWS-HMAC",
    "AccessKeyId" : process.env.AWS_ACCESS_KEY_ID,
    "SecretAccessKey" : process.env.AWS_SECRET_ACCESS_KEY,
    "Token" : process.env.AWS_SESSION_TOKEN,
    "Expiration" : new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString()
  }

  var creds_json = JSON.stringify(creds)



// Make our HTTP server
const server = http.createServer((req, res) => {
    // Parse the request url
    const reqUrl = url.parse(req.url).pathname
    console.debug(reqUrl)
    // Compare our request method
    if (reqUrl == "/latest/meta-data/iam/security-credentials/") {
            res.write("default")
            res.end()

    } else if (reqUrl == "/shutdown/") {
        res.end()
        shutdown()

    }else if (reqUrl == "/latest/meta-data/iam/security-credentials/default") {
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.write(creds_json)
            res.end()
    } else{
        res.writeHead(404)
        res.write("not found")
        res.end()
    }
    
})
// Have the server listen on port 80
console.log("ec2-meta-mock started.")
server.listen(80, "169.254.169.254")
