const { exec } = require("child_process");
console.log("Shutting down EC2 Meta mock")
exec("sudo pkill -f ec2-meta-mock-server")