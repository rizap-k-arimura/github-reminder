aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 943714519719.dkr.ecr.ap-northeast-1.amazonaws.com
docker build -t github-reminder --platform linux/amd64 .
docker tag github-reminder:latest 943714519719.dkr.ecr.ap-northeast-1.amazonaws.com/github-reminder:latest
docker push 943714519719.dkr.ecr.ap-northeast-1.amazonaws.com/github-reminder:latest
