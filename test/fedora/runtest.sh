#!/bin/bash
sudo docker run -d --name powerstrip-weave \
    --expose 80 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    binocarlos/powerstrip-weave launch
sudo docker run -d --name powerstrip \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/vagrant/powerstrip-demo/adapters.yml:/etc/powerstrip/adapters.yml \
  --link powerstrip-weave:weave \
  -p 2375:2375 \
  clusterhq/powerstrip
sleep 5
sudo docker run --rm ubuntu echo now running the connection test
sudo docker -H tcp://127.0.0.1:2375 run --name test-container -e "WEAVE_CIDR=10.255.0.52/24" -d binocarlos/powerstrip-weave-example hello world
sudo docker logs test-container
sudo docker ps -aq | xargs sudo docker rm -f