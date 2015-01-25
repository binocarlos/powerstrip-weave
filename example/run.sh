#!/bin/bash
counter=0
max=100

function tickcounter() {
  counter=$((counter+1))
  let counterms=$counter*100
  echo "$counterms ms elapsed"
  if (( counter >= max )); then
    quitcounter
  fi
  sleep .1
}

function quitcounter() {
  let ms=$counter*100
  echo "Network did not connect after $ms ms";
  ifconfig;  
}

function finishcounter() {
  let ms=$counter*100
  echo "--------------------------------"
  echo "Network took: $ms ms to connect"
  echo "Args: $@"
  echo "--------------------------------"
  ifconfig;
}

while ! grep -q ^1$ /sys/class/net/ethwe/carrier 2>/dev/null
do tickcounter
done
finishcounter "$@"
