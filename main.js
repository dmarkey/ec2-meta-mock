
const cp = require('child_process');
process.chdir(__dirname)
cp.exec("nohup sudo -E node ec2-meta-mock-server.js > /dev/null 2>&1 &")
