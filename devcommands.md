## development commands

To run the node server without restarting the whole stack each time:

```bash
$ docker run -ti --rm --name powerstrip-weave \
    --expose 80 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    -v /srv/projects/powerstrip-weave:/srv/app \
    binocarlos/powerstrip-weave softlaunch
```