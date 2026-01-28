pipeline {
    agent none

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
                    args '--network=host'
                }
            }
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Unit Tests (Vitest)') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
                    args '--network=host'
                }
            }
            steps {
                sh 'npm run test'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'html',
                        reportFiles: 'index.html',
                        reportName: 'VitestReport',
                        reportTitles: 'Vitest - Unit Tests',
                        useWrapperFileDirectly: true
                    ])
                }
            }
        }

        stage('UI Tests (Playwright)') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.57.0-noble'
                    args '--network=host'
                }
            }
            steps {
                sh 'npm run test:e2e'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: false,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'PlaywrightReport',
                        reportTitles: 'Playwright - UI Tests',
                        useWrapperFileDirectly: true
                    ])
                }
            }
        }
    }
}
