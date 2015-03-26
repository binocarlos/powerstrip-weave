#!/bin/bash
cmd-config(){
  cat > ~/powerstrip-demo/adapters.yml <<EOF
version: 1
endpoints:
  "POST /*/containers/create":
    pre: [weave]
  "POST /*/containers/*/start":
    post: [weave]
  "POST /*/containers/*/restart":
    post: [weave]
adapters:
  weave: http://weave/extension
EOF
  cat ~/powerstrip-demo/adapters.yml
}

cmd-ps-weave(){
  docker run -d \
    --name powerstrip-weave \
    --expose 80 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    binocarlos/powerstrip-weave launch
}

cmd-ps(){
  docker run -d \
    --name powerstrip \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v ~/powerstrip-demo/adapters.yml:/etc/powerstrip/adapters.yml \
    --link powerstrip-weave:weave \
    -p 2375:2375 \
    clusterhq/powerstrip
}

cmd-ps-weaverun(){
  CID=$(DOCKER_HOST=127.0.0.1:2375 docker run -e "WEAVE_CIDR=10.255.0.51/8" -d binocarlos/powerstrip-weave-example hello world)
  sleep 2
  docker logs $CID
  docker rm $CID
}

cmd-shutdown(){
  docker rm -f powerstrip
  docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    binocarlos/powerstrip-weave stop
}

cmd-all(){
  cmd-config
  cmd-ps-weave
  cmd-ps
  sleep 2
  cmd-ps-weaverun
  sleep 2
  docker logs powerstrip
  docker logs powerstrip-weave
  cmd-shutdown
}

usage() {
  echo "Usage:"
  echo "example.sh config"
  echo "example.sh ps-weave"
  echo "example.sh ps"
  echo "example.sh ps-weaverun"
  echo "example.sh shutdown"  
  exit 1
}

main() {
  case "$1" in
  config)             shift; cmd-config "$@";;
  ps-weave)           shift; cmd-ps-weave "$@";;
  ps)                 shift; cmd-ps "$@";;
  ps-weaverun)        shift; cmd-ps-weaverun "$@";;
  all)                shift; cmd-all "$@";;
  shutdown)           shift; cmd-shutdown "$@";;
  *)                  usage "$@";;
  esac
}

main "$@"
