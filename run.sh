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
  cmd-weave launch $@
  node /srv/app/index.js
}


# remove the powerstrip-weave container (or whatever it is called)
# stop weave itself
# remove the weavetools container
cmd-stop(){
  local pluginname=$1
  if [[ -z $pluginname ]]; then
    pluginname="powerstrip-weave"
  fi
  cmd-weave stop
  docker stop $pluginname
  docker rm $pluginname
  docker rm weavetools
}

main() {
  case "$1" in
  launch)             shift; cmd-launch $@;;
  stop)               shift; cmd-stop $@;;
  weave)              shift; cmd-weave-cli $@;;
  *)                  cmd-weave $@;;
  esac
}

main "$@"