#!/bin/bash
cmd-config(){
  cat > ~/powerstrip-demo/adapters.yml <<EOF
version: 1
endpoints:
  "POST /*/containers/create":
    pre: [debug, weave, debug]
  "POST /*/containers/*/start":
    post: [debug, weave, debug]
adapters:
  debug: http://debug/extension
  weave: http://weave/extension
EOF
  cat ~/powerstrip-demo/adapters.yml
}

cmd-ps-debug(){
  docker run -ti --rm \
    --name powerstrip-debug \
    --expose 80 \
    binocarlos/powerstrip-debug
}

cmd-ps-weave(){
  docker run -d \
    --name powerstrip-weave \
    --expose 80 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave launch
}

cmd-ps(){
  docker run -d \
    --name powerstrip \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v ~/powerstrip-demo/adapters.yml:/etc/powerstrip/adapters.yml \
    --link powerstrip-weave:weave \
    --link powerstrip-debug:debug \
    -p 2375:2375 \
    clusterhq/powerstrip
}

cmd-weaverun(){
  export DOCKER_HOST=
  CID=$(sudo weave run 10.255.0.50/8 binocarlos/powerstrip-weave-example hello world)
  docker logs $CID
  docker rm $CID
}

cmd-ps-weaverun(){
  export DOCKER_HOST=127.0.0.1:2375
  CID=$(docker run -e "WEAVE_CIDR=10.255.0.51/8" -d binocarlos/powerstrip-weave-example hello world)
  docker logs $CID
  docker rm $CID
}

cmd-shutdown(){
  docker stop powerstrip-debug && docker rm powerstrip-debug
  docker stop powerstrip && docker rm powerstrip
  docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave stop
}

usage() {
  echo "Usage:"
  echo "example.sh config"
  echo "example.sh ps-debug"
  echo "example.sh ps-weave"
  echo "example.sh ps"
  echo "example.sh weaverun"
  echo "example.sh ps-weaverun"
  echo "example.sh shutdown"  
  exit 1
}

main() {
  case "$1" in
  config)             shift; cmd-config "$@";;
  ps-debug)           shift; cmd-ps-debug "$@";;
  ps-weave)           shift; cmd-ps-weave "$@";;
  ps)                 shift; cmd-ps "$@";;
  weaverun)           shift; cmd-weaverun "$@";;
  ps-weaverun)        shift; cmd-ps-weaverun "$@";;
  config)             shift; cmd-config "$@";;
  *)                  usage "$@";;
  esac
}

main "$@"
