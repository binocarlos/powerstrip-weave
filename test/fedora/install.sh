#!/bin/bash
setenforce 0
service docker start
sleep 5
mkdir -p /home/vagrant/powerstrip-demo
cat > /home/vagrant/powerstrip-demo/adapters.yml <<EOF
endpoints:
  "POST /*/containers/create":
    pre: [weave]
  "POST /*/containers/*/start":
    post: [weave]
  "POST /*/containers/*/restart":
    post: [weave]
adapters:
  weave: http://weave/v1/extension
EOF
docker pull clusterhq/powerstrip:latest
docker pull binocarlos/powerstrip-weave:latest
docker pull binocarlos/powerstrip-weave-example:latest
docker pull binocarlos/wait-for-weave:latest
docker pull zettio/weave:latest