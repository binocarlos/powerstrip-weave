powerstrip-weave
================

A [Powerstrip](https://github.com/ClusterHQ/powerstrip) adapter that runs [weave](https://github.com/zettio/weave) inside a container and ensures that containers are connected to the weave network before running their entrypoints.

## run the adapter

```bash
$ docker run -d --name powerstrip-weave \
    --expose 80 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave launch
```

The `launch` command does the following:

 * runs the weave container (by running weave launch)
 * runs a container called `weavewait` so its volume can be used to access the [wait-for-weave](https://github.com/binocarlos/wait-for-weave) binary
 * launches the HTTP adapter server

To ensure matching versions of the docker client / server - we mount the docker socket and docker binary from the host.

#### connect multiple hosts

If you are running multiple servers that you want to connect using weave - you pass the arguments you would normally pass to `weave launch`:

```bash
$ docker run -d --name powerstrip-weave \
    --expose 80 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave launch 1.2.3.4 -password wEaVe
```

## run powerstrip

First create a powerstrip configuration:

```bash
$ mkdir -p ~/powerstrip-demo
$ cat > ~/powerstrip-demo/adapters.yml <<EOF
endpoints:
  "POST /*/containers/create":
    pre: [weave]
  "POST /*/containers/*/start":
    post: [weave]
adapters:
  weave: http://weave/v1/extension
EOF
```

And then run the powerstrip container and link it to the powerstrip-weave container:

```bash
$ docker run -d --name powerstrip \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/powerstrip-demo/adapters.yml:/etc/powerstrip/adapters.yml \
  --link powerstrip-weave:weave \
  -p 2375:2375 \
  clusterhq/powerstrip
```

## run containers

Now you can use the normal docker client to run containers that will connect to the weave network and wait for the network to be connected before running the job.

First you must export the `DOCKER_HOST` variable to point at the powerstrip server:

```bash
$ export DOCKER_HOST=tcp://127.0.0.1:2375
```

You tell powerstrip-weave what IP address you want to give a container by using the `WEAVE_CIDR` environment variable of a container - here we run a database server:

```bash
$ docker run -d --name mysql \
    -e WEAVE_CIDR=10.255.0.1/8 \
    binocarlos/mysql-server
```

## weave commands

You can get the status of the weave network by running the `status` command:

```bash
$ docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave status
```

You can run normal weave network commands like `expose` and `attach`:

```bash
$ docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave expose 10.255.0.1/8
```

You could even run `weave run` using this method although it would not wait for the weave network to be connected if you use this method.

## shutdown

To shutdown cleanly (i.e. close the adapter / weave and remove the wait-for-weave volume container):

```bash
$ docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave stop
```

If you named the adapter container something different - pass the name as the first argument to the `stop` command:

```bash
$ docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /usr/bin/docker:/usr/bin/docker \
    binocarlos/powerstrip-weave stop powerstrip-weave
```

## examples
There is a [walk-through example](https://github.com/binocarlos/powerstrip-weave/tree/master/example) of running powerstrip-weave.

There is also an example of a [fig stack](https://github.com/binocarlos/powerstrip-weave/tree/master/example#running-the-fig-example) that links 2 containers using weave IP addresses.

## notes

 * [plan for this project](https://github.com/zettio/weave/issues/47#issuecomment-69471269)
 * [running weave inside a container](https://github.com/zettio/weave/issues/312)
 * [mounting the blocking binary in a volume](https://github.com/zettio/weave/issues/47#issuecomment-68787816)
 * [wait-for-weave](https://github.com/binocarlos/wait-for-weave)

## licence

Copyright 2015 Kai Davenport & Contributors

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.