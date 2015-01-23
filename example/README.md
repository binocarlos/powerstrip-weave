softlaunch powerstrip-weave

docker run -ti --rm --name powerstrip-weave     --expose 80     -v /var/run/docker.sock:/var/run/docker.sock     -v /usr/bin/docker:/usr/bin/docker     -v /srv/projects/powerstrip-weave:/srv/app     binocarlos/powerstrip-weave softlaunch

Run the powerstrip-debug

sudo node index.js



run powerstrip


docker run -ti --rm --name powerstrip   -v /var/run/docker.sock:/var/run/docker.sock   -v ~/powerstrip-demo/adapters.yml:/etc/powerstrip/adapters.yml   --link powerstrip-weave:weave   -p 2375:2375   clusterhq/powerstrip


normal weave command


sudo weave run 10.255.0.14/8 binocarlos/echo


powerstrip weave command

docker run -e "WEAVE_CIDR=10.255.0.14/8" -d binocarlos/echo