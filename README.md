# Jenkins CI/CD Pipeline Guide for Beginners

I'll walk you through creating a complete Jenkins pipeline that automatically builds, tests, and deploys a simple application when code changes are pushed to Git.

## Prerequisites

Before we start, ensure you have:
- A computer with admin access
- Basic command line knowledge
- Git installed on your machine
- A GitHub account

## Step 1: Install Jenkins

### On Windows:
1. Download Jenkins from [jenkins.io](https://jenkins.io/download/)
2. Run the installer and follow the setup wizard
3. Jenkins will start automatically on `http://localhost:8080`

### On macOS:
```bash
# Install using Homebrew
brew install jenkins-lts
brew services start jenkins-lts
```

### On Linux (Ubuntu/Debian):
```bash
# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install jenkins
sudo systemctl start jenkins

# Install Node.js and npm
sudo apt install nodejs npm

# Verify the installation
node -v
npm -v
```

## Step 2: Initial Jenkins Setup

1. **Access Jenkins**: Open `http://localhost:8080` in your browser
2. **Unlock Jenkins**: Find the initial admin password:
   ```bash
   # Location varies by OS
   # Linux/macOS: /var/lib/jenkins/secrets/initialAdminPassword
   # Windows: C:\Users\{username}\.jenkins\secrets\initialAdminPassword
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. **Install Plugins**: Choose "Install suggested plugins"
4. **Create Admin User**: Fill in your details
5. **Configure Instance**: Keep default URL or customize

## Step 3: Create a Simple Test Application

Let's create a simple Node.js application:

1. **Create a new directory**:
   ```bash
   mkdir my-jenkins-app
   cd my-jenkins-app
   ```

2. **Initialize the project**:
   ```bash
   npm init -y
   ```

3. **Create `app.js`**:
   ```javascript
   const express = require('express');
   const app = express();
   const port = process.env.PORT || 3000;

   app.get('/', (req, res) => {
     res.json({ message: 'Hello Jenkins CI/CD!', timestamp: new Date().toISOString() });
   });

   app.get('/health', (req, res) => {
     res.json({ status: 'healthy' });
   });

   const server = app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });

   module.exports = server;
   ```

4. **Create `package.json` scripts**:
   ```json
   {
     "name": "my-jenkins-app",
     "version": "1.0.0",
     "scripts": {
       "start": "node app.js",
       "test": "jest",
       "build": "echo 'Build completed successfully'"
     },
     "dependencies": {
       "express": "^4.18.2"
     },
     "devDependencies": {
       "jest": "^29.0.0",
       "supertest": "^6.3.0"
     }
   }
   ```

5. **Create test file `app.test.js`**:
   ```javascript
   const request = require('supertest');
   const app = require('./app');

   describe('App Tests', () => {
     afterAll((done) => {
       app.close(done);
     });

     test('GET / should return welcome message', async () => {
       const response = await request(app).get('/');
       expect(response.status).toBe(200);
       expect(response.body.message).toBe('Hello Jenkins CI/CD!');
     });

     test('GET /health should return healthy status', async () => {
       const response = await request(app).get('/health');
       expect(response.status).toBe(200);
       expect(response.body.status).toBe('healthy');
     });
   });
   ```

6. **Create `Jenkinsfile`**:
   ```groovy
   pipeline {
       agent any
       
       tools {
           nodejs 'NodeJS'
       }
       
       stages {
           stage('Checkout') {
               steps {
                   echo 'Checking out code from repository...'
                   checkout scm
               }
           }
           
           stage('Install Dependencies') {
               steps {
                   echo 'Installing npm dependencies...'
                   sh 'npm install'
               }
           }
           
           stage('Run Tests') {
               steps {
                   echo 'Running tests...'
                   sh 'npm test'
               }
               post {
                   always {
                       echo 'Test stage completed'
                   }
               }
           }
           
           stage('Build') {
               steps {
                   echo 'Building application...'
                   sh 'npm run build'
               }
           }
           
           stage('Deploy') {
               steps {
                   echo 'Deploying application...'
                   sh '''
                       echo "Starting deployment..."
                       # Kill any existing process
                       pkill -f "node app.js" || true
                       # Start the application in background
                       nohup npm start > app.log 2>&1 &
                       sleep 5
                       echo "Application deployed and running"
                   '''
               }
           }
       }
       
       post {
           success {
               echo 'Pipeline completed successfully!'
           }
           failure {
               echo 'Pipeline failed!'
           }
           always {
               echo 'Cleaning up workspace...'
               cleanWs()
           }
       }
   }
   ```

## Step 4: Set Up Git Repository

1. **Initialize Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Simple Node.js app with Jenkins pipeline"
   ```

2. **Create GitHub repository**:
   - Go to GitHub and create a new repository
   - Name it `my-jenkins-app`
   - Don't initialize with README (we already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/my-jenkins-app.git
   git branch -M main
   git push -u origin main
   ```

## Step 5: Configure Jenkins Pipeline

### Install Required Plugins:
1. Go to **Manage Jenkins** → **Manage Plugins**
2. Install these plugins:
   - Git Plugin
   - GitHub Plugin
   - NodeJS Plugin
   - Pipeline Plugin (usually pre-installed)
   - Workspace Cleanup Plugin

### Configure Node.js:
1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Find **NodeJS** section
3. Click **Add NodeJS**
4. Name: `NodeJS`
5. Version: Choose latest LTS version
6. Save

### Create Jenkins Job:
1. **New Item** → Enter name: `my-jenkins-app-pipeline`
2. Select **Pipeline** → **OK**
3. **Pipeline** section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/YOUR_USERNAME/my-jenkins-app.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
4. **Save**

## Step 6: Set Up Webhook for Automatic Triggering

### In Jenkins:
1. Open your pipeline job
2. **Configure** → **Build Triggers**
3. Check **GitHub hook trigger for GITScm polling**
4. **Save**

### In GitHub:
1. Go to your repository → **Settings** → **Webhooks**
2. **Add webhook**:
   - Payload URL: `http://YOUR_JENKINS_URL:8080/github-webhook/`
   - Content type: **application/json**
   - Events: **Just the push event**
   - **Active**: ✓
3. **Add webhook**

## Step 7: Test the Pipeline

### Manual Test:
1. Go to your Jenkins job
2. Click **Build Now**
3. Watch the console output for each stage

### Automatic Test:
1. Make a change to your code:
   ```bash
   # Edit app.js - change the welcome message
   # Commit and push
   git add .
   git commit -m "Update welcome message"
   git push origin main
   ```
2. Check Jenkins - a new build should start automatically!

## Step 8: Monitor and Verify

### Check Build Status:
- **Blue Ocean** plugin provides a modern UI
- Console output shows detailed logs
- Build history shows success/failure trends

### Verify Deployment:
```bash
# Check if app is running
curl http://localhost:3000
# Should return: {"message":"Hello Jenkins CI/CD!","timestamp":"..."}

curl http://localhost:3000/health
# Should return: {"status":"healthy"}
```

## Troubleshooting Common Issues

### Build Fails on Node.js:
```bash
# Ensure Node.js is properly configured in Global Tool Configuration
# Check that the NodeJS tool name matches what's in Jenkinsfile
```

### Webhook Not Triggering:
- Verify Jenkins URL is accessible from GitHub
- Check webhook delivery in GitHub settings
- Ensure firewall allows inbound connections to port 8080

### Permission Issues:
```bash
# On Linux/macOS, Jenkins user might need permissions
sudo usermod -a -G docker jenkins  # If using Docker
# Restart Jenkins after permission changes
```

## Next Steps for Learning

1. **Add More Stages**: Database migrations, security scans
2. **Multiple Environments**: Staging and production deployments
3. **Docker Integration**: Containerize your application
4. **Advanced Testing**: Integration tests, performance tests
5. **Notifications**: Slack, email notifications for build results
6. **Parallel Builds**: Run tests in parallel for faster feedback

## Key Learning Points

- **Pipeline as Code**: Jenkinsfile keeps CI/CD configuration in version control
- **Automation**: Webhooks enable automatic builds on code changes
- **Stages**: Logical separation of build, test, and deploy phases
- **Feedback Loop**: Quick feedback on code quality and deployment status

This setup provides a solid foundation for understanding CI/CD concepts with Jenkins. Start simple and gradually add complexity as you become more comfortable with the workflow!
