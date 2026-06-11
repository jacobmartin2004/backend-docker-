pipeline {
    agent any

    environment {
        IMAGE_NAME = 'backend-docker'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'backend-docker'
        CONTAINER_PORT = '3000'
        HOST_PORT = '3000'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Stop Old Container') {
            steps {
                sh """
                docker stop ${CONTAINER_NAME} 2>/dev/null || true
                docker rm ${CONTAINER_NAME} 2>/dev/null || true
                """
            }
        }

        stage('Run New Container') {
            steps {
                sh """
                docker run -d \
                    --name ${CONTAINER_NAME} \
                    --restart unless-stopped \
                    -p ${HOST_PORT}:${CONTAINER_PORT} \
                    -e NODE_ENV=production \
                    ${IMAGE_NAME}:latest
                """
            }
        }

        stage('Verify Container') {
            steps {
                sh """
                docker ps
                docker logs ${CONTAINER_NAME} --tail=50
                """
            }
        }
    }

    post {
        success {
            echo "Build ${env.BUILD_NUMBER} deployed successfully."
        }

        failure {
            echo "Build ${env.BUILD_NUMBER} failed. Check console logs."
        }

        always {
            sh 'docker image prune -f 2>/dev/null || true'
        }
    }
}