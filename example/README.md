debug-example
=============

Here is an run through example of getting the `powerstrip-weave` adapter to assign a weave IP address via the vanilla docker client and blocking until the network is connected.

## pull images

To make the example run smoother - first pull images:

```bash
$ docker pull clusterhq/powerstrip:latest
$ docker pull binocarlos/powerstrip-weave:latest
$ docker pull binocarlos/powerstrip-weave-example:latest
$ docker pull binocarlos/powerstrip-debug:latest
$ docker pull binocarlos/wait-for-weave:latest
```

## adapters.yml

The adapters.yml controls which adapters that powerstrip will hook into.

In this example, we pipe from the debug -> weave -> debug adapters so we can see the effect that the weave adapter has on the requests.

```bash
$ cat > ~/powerstrip-demo/adapters.yml <<EOF
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
```

## powerstrip-debug container

The debug container will output any requests to stdout and is useful to see the effect that powerstrip adapters have on docker requests.

In a new terminal window:

```bash
$ docker run -ti --rm \
    --name powerstrip-debug \
    --expose 80 \
    binocarlos/powerstrip-debug
```

## powerstrip-weave container

The powerstrip-weave adapter will hijack the entry point of any container that has been given a `WEAVE_CIDR` environment variable.

In another terminal window:

```bash
$ docker run -ti --rm \
    --name powerstrip-weave \
    --expose 80 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave launch
```

## powerstrip container

The powerstrip container is what we will direct our docker client towards and is responsible for hitting the adapters with docker remote API requests.

Notice how we are linking to the `powerstrip-weave` and the `powerstrip-debug` containers so powerstrip can contact them with requests.

In another terminal window:

```bash
$ docker run -ti --rm \
    --name powerstrip \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v ~/powerstrip-demo/adapters.yml:/etc/powerstrip/adapters.yml \
    --link powerstrip-weave:weave \
    --link powerstrip-debug:debug \
    -p 2375:2375 \
    clusterhq/powerstrip
```

## install weave

So we can compare the different between normal weave and powerstrip-weave - ensure that you have [installed weave](https://github.com/zettio/weave#installation) on your host.

## run normal weave container

In another (final) terminal window:

The first example is running the `powerstrip-weave-example` container via weave normally.

```bash
$ CID=$(sudo weave run 10.255.0.50/8 binocarlos/powerstrip-weave-example)
$ docker logs $CID
```

You should see that it has taken around 500 -> 800 ms for the weave network to connect.

## redirect the docker client

Now we will direct our docker client to send requests to the powerstrip HTTP api rather than the normal UNIX socket:

```bash
$ export DOCKER_HOST=127.0.0.1:2375
```

## run a container via the adapter

Finally we run a container that is modified by the powerstrip-weave adapter like so:

```bash
$ CID=$(docker run -e "WEAVE_CIDR=10.255.0.51/8" -d binocarlos/powerstrip-weave-example)
$ docker logs $CID
```

It should report that it has taken 0 ms for the weave network to connect.  This is because the entrypoint has been hijacked and remapped to `wait-for-weave` which has paused until the weave network has connected.