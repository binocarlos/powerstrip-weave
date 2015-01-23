#!/bin/bash

while ! grep -q ^1$ /sys/class/net/ethwe/carrier 2>/dev/null
do echo "no network" && sleep .1
done
echo "have network now"