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
                sh 'npm run test || true'
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
                sh 'npm run test:e2e || true'
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
       stage('Docker (build & push)') {
    agent any
    when { branch 'main' }

    environment {
        CI_REGISTRY = 'ghcr.io'
        CI_REGISTRY_USER = 'abdallah-hamrouni'
        CI_REGISTRY_IMAGE = "${CI_REGISTRY}/${CI_REGISTRY_USER}/chess:latest"
        CI_REGISTRY_PASSWORD = credentials('CI_REGISTRY_PASSWORD')
    }

    steps {
        sh 'docker build --network=host -t $CI_REGISTRY_IMAGE .'
        sh 'echo $CI_REGISTRY_PASSWORD | docker login $CI_REGISTRY -u $CI_REGISTRY_USER --password-stdin'
        sh 'docker push $CI_REGISTRY_IMAGE'
    }
}

stage('Deploy (Netlify)') {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.57.0-noble'
      args '--network=host'
    }
  }
  when { branch 'main' }
  environment {
    NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
    NETLIFY_SITE_ID    = credentials('NETLIFY_SITE_ID')
  }
  steps {
    sh 'npm ci || npm install'
    sh 'npm run build'
    sh 'npx netlify deploy --prod --dir=dist --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN'
  }
}


    }
}