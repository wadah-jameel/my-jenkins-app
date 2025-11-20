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
