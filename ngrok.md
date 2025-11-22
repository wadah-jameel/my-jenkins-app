# ngrok
### ngrok is a service that creates secure, public URLs that forward to a local server running on your machine. It acts as a reverse proxy, allowing developers to expose a local development server to the internet for testing, demonstrations, or to allow external services like webhooks to communicate with it without complex network configurations. 

## Install ngrok (Ubuntu linux)
```bash
## Open your terminal and use wget to download the zip file.
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip

## Unzip the downloaded file:
unzip ngrok-stable-linux-amd64.zip

## Move the ngrok executable to a directory in your system's PATH, such as /usr/local/bin/:
sudo mv ngrok /usr/local/bin/
```
## Create a free account on the ngrok website and copy your authtoken from the dashboard.
```bash
ngrok config add-authtoken <your_auth_token>
```

## Run ngrok
### ou can now run ngrok to tunnel traffic. For example, to tunnel to a local web server running on port \(8080\), you would use:
```bash
ngrok http 8080
```

## Add ngtok url to github webhook
```bash
This gives you a public URL like `https://abc123.ngrok.io`

Update your GitHub webhook to:

https://abc123.ngrok.io/github-webhook/
```

## Jenkins should now trigger build and testing automatically when code commit happend on github repo.
