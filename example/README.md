debug-example
=============

Here is an run through example of getting the `powerstrip-weave` adapter to assign a weave IP address and then run the job.

This is a very manual walk-through and is used to illustrate the way that the adapter works.  Things will be far simpler when the images are public and on the Docker hub.

The reason for opening so many shell windows is so we can see the output of the various components.

In reality we would be running these containers using the `-d` flag not `-ti`.

NOTE: we are running the example containers in detached mode until a small bug in powerstrip prevent stdout being displayed is fixed.

## build images

First - we build the docker images we will need - these will end up on the Docker hub but for the moment are best built manually.

Replace `/srv/projects` with where you keep your github repos.

##### powerstrip

We need the powerstrip image itself (after a `git clone https://github.com/clusterhq/powerstrip`)

```bash
$ cd /srv/projects/powerstrip
$ docker build -t clusterhq/powerstrip .
```

##### powerstrip-weave

Then we need to build the powerstrip-weave image (after a `git clone https://github.com/binocarlos/powerstrip-weave`)

```bash
$ cd /srv/projects/powerstrip-weave
$ docker build -t binocarlos/powerstrip-weave .
```

##### powerstrip-weave-example

For this example we have a simple docker image that will print how long it has taken to connect to the weave network - to build this image:


```bash
$ cd /srv/projects/powerstrip-weave/example
$ docker build -t binocarlos/powerstrip-weave-example .
```

##### powerstrip-debug

Then we need to build the powerstrip-debug image (after a `git clone https://github.com/binocarlos/powerstrip-debug`)

```bash
$ cd /srv/projects/powerstrip-debug
$ docker build -t binocarlos/powerstrip-debug .
```

##### wait-for-weave

To ensure that the latest wait-for-weave image is on your machine:

```bash
$ docker pull binocarlos/wait-for-weave
```

## powerstrip-debug container

Open a new shell window so we can see the debug adapter output:

```bash
$ docker run -ti --rm \
    --name powerstrip-debug \
    --expose 80 \
    binocarlos/powerstrip-debug
```

## powerstrip-weave container

Open another shell window and we can launch the powerstrip-weave stack:

```bash
$ docker run -ti --rm \
    --name powerstrip-weave \
    --expose 80 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave launch
```

## create adapters.yml

We make an adapters.yml file which will use both the debug and weave adpaters.

We pipe from the debug -> weave -> debug so we can see the effect that weave has on the requests.

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

## powerstrip container

Open another shell window and we can launch the powerstrip container:
 
Start the powerstrip container - we link to the `debug` and `weave` adapters:

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

Open another shell window.

The first example is running the `powerstrip-weave-example` container via weave normally.

```bash
$ CID=$(sudo weave run 10.255.0.50/8 binocarlos/powerstrip-weave-example)
$ docker logs $CID
```

You should see that it has taken around 500 -> 800 ms for the weave network to connect.

## run powerstrip-weave container

Now we will direct our docker client to powerstrip:

```bash
$ export DOCKER_HOST=127.0.0.1:2375
```

And will run the same example as above but via the vanilla docker client:

```bash
$ CID=$(docker run -e "WEAVE_CIDR=10.255.0.51/8" -d binocarlos/powerstrip-weave-example)
$ docker logs $CID
```

It should report that it has taken 0 ms for the weave network to connect.

This is because the entrypoint has been hijacked and remapped to `wait-for-weave` which has paused until the weave network has connected.

Also - we are allocated a weave IP using the standard docker client.

Once we can pipe stdout from powerstrip - we will be able to run this in attached mode too!

## run powerstrip-weave status

You can get the status of the weave deamon using this command:

NOTE: run this via the normal docker server not powerstrip (until stdout is fixed)

```bash
$ docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave status
```

## shutdown

To shutdown powerstrip-weave (including weave + wait-for-weave):

NOTE: run this via the normal docker server not powerstrip (until stdout is fixed)

```bash
$ docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave stop
```

