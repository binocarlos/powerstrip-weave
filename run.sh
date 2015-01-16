#!/bin/bash

cmd-weave-cli(){
  /usr/local/bin/weave $@
}

cmd-weave(){
  docker run --rm \
    --net=host \
    --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    -v /proc:/hostproc \
    -e PROCFS=/hostproc \
    binocarlos/powerstrip-weave weave $@
}

# we ensure there is a weavetools container with
# wait-for-weave in a volume
cmd-launch(){
  docker run --name weavetools binocarlos/wait-for-weave
  cmd-weave $@
  node /srv/plugin/index.js
}

# reomve the weavetools container
cmd-stop(){
  cmd-weave $@
}

main() {
  case "$1" in
  launch)             cmd-launch $@;;
  stop)               cmd-stop $@;;
  weave)              shift; cmd-weave-cli $@;;
  *)                  cmd-weave $@;;
  esac
}

main "$@"