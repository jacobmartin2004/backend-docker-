pipeline {
    agent any

    environment {
        IMAGE_NAME   = 'backend-docker'
        IMAGE_TAG    = "${env.BUILD_NUMBER}"
        REGISTRY     = ''                        // e.g. docker.io/myuser  — leave empty for local
        CONTAINER_PORT = '3000'
        HOST_PORT    = '3000'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci --only=production'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def fullTag = REGISTRY ? "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}" : "${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker build -t ${fullTag} ."
                    // Also tag as latest
                    def latestTag = REGISTRY ? "${REGISTRY}/${IMAGE_NAME}:latest" : "${IMAGE_NAME}:latest"
                    sh "docker tag ${fullTag} ${latestTag}"
                }
            }
        }

        stage('Push to Registry') {
            when {
                expression { return REGISTRY != '' }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo '${DOCKER_PASS}' | docker login ${REGISTRY} -u '${DOCKER_USER}' --password-stdin"
                    sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${REGISTRY}/${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Stop and remove existing container if running
                    sh """
                        docker stop ${IMAGE_NAME} 2>/dev/null || true
                        docker rm   ${IMAGE_NAME} 2>/dev/null || true
                    """
                    def runTag = REGISTRY ? "${REGISTRY}/${IMAGE_NAME}:latest" : "${IMAGE_NAME}:latest"
                    sh """
                        docker run -d \
                            --name ${IMAGE_NAME} \
                            --restart unless-stopped \
                            -p ${HOST_PORT}:${CONTAINER_PORT} \
                            -e NODE_ENV=production \
                            ${runTag}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Build ${env.BUILD_NUMBER} deployed successfully."
        }
        failure {
            echo "Build ${env.BUILD_NUMBER} failed. Check logs above."
        }
        always {
            // Clean up dangling images to save disk space
            sh 'docker image prune -f 2>/dev/null || true'
        }
    }
}
