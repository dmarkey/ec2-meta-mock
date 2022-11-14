# EC2 Meta Mock
Simple service to mock ec2 IAM credentials.

## What does it do?

This is a super small node.js service that emulates the EC2 metadata service that serves IAM credentials. In the case of ec2-meta-mock it serves the credentials that have been provided via environment variables.

## Why would I use this?

I made this to make the transition from EC2 builders to GitHub actions. It provides an easy way for docker containers to discover the crededtials instead of passing AWS_* environment variables around.

## When shouldn't I use this?

Do not use then on self-hosted runners on EC2. Use the EC2 instance role instead.

Do not use this if you are using simple builds that can use the AWS environment variables directly.

Do *NOT* use this on a shared environment as all users on the same machine will be able to access the credentials.

**Be Aware**

Cloud providers(AWS, Azure) use the `169.254.169.254` IP that this service emulates. Some daemons on your cloud instance may misbehave or crash.

## How to use.


### Direct use.

To use directly you will need to have a valid AWS session in your environment(`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN`), here is an example using `aws-vault`:

```
➜  ec2-meta-mock git:(main) aws-vault exec dev
➜  ec2-meta-mock git:(main)

```

ec2-meta-mock *needs* to be ran as root because it sets up networking to emulate the EC2 metadata service. use `sudo -E` to pass the required variables to the process.

MacOS and Linux is supported.

```
➜  ec2-meta-mock git:(main) sudo -E node ec2-meta-mock-server.js
ec2-meta-mock started.
```

Now on another tab:

```
➜  ~ aws sts get-caller-identity
{
    "UserId": "xxx:xxx",
    "Account": "xxx",
    "Arn": "arn:aws:sts::xxx:assumed-role/dev-xxx-xxx-xxxx/xxxx"
}
```

Take into account that these will expire when the original credentials will expire or 6 hours, which ever is nearest.

### Deploy as a Github actions workflow.

This example github workflow retreives AWS credentials via the a AWS Federation with Github.

Then ec2-meta-mock brings up the EC2 metadata mock service.

You can see the last step runs the AWS cli in docker and prints to the terminal the identity that is being served, notice that no AWS credentials are being passed to the docker container, they are auto discovered by the AWS SDK. This should also work with all other AWS SDKs.

After the build id complete, the service is terminated in a post step.

```
name: Example-Build

on:
  push:
    branches: [ "actions-test" ]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
      issues: write
      pull-requests: write
      checks: write
    steps:
    - uses: actions/checkout@v3
    - name: configure aws credentials
      uses: aws-actions/configure-aws-credentials@v1-node16
      with:
        role-to-assume: arn:aws:iam::xxx:role/github-actions-role
        role-session-name: role-session
        aws-region: us-west-2
    - name: EC2 Meta Mock
      id: ec2-meta-mock
      uses: dmarkey/ec2-meta-mock@v1
    - name: check identity
      run: docker run --rm -i amazon/aws-cli sts get-caller-identity
```
