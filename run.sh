#!/bin/bash

cmd-weave(){
  /usr/local/bin/weave $@
}

# ensure there is a weavetools container with wait-for-weave in a volume
cmd-launch(){
  docker run --name weavetools binocarlos/wait-for-weave
  echo "launch"
}

# reomve the weavetools container
cmd-stop(){
  docker rm weavetools
  cmd-weave $@
}

main() {
  case "$1" in
  plugin)             cmd-plugin $@;;
  *)                  cmd-weave $@;;
  esac
}

main "$@"