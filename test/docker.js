var tape = require('tape');
var cp = require('child_process');
var fs = require('fs');
var async = require('async');

var powerstripConfig = [
  'version: 1',
  'endpoints:',
  '  "POST /*/containers/create":',
  '    pre: [weave]',
  '  "POST /*/containers/*/start":',
  '    post: [weave]',
  'adapters:',
  '  weave: http://weave/extension',
  ''
].join("\n")

var adapterConfig = '/tmp/powerstrip-weave-adapters.yml';

tape('the example should run', function(t){

  // write the adapter config
  fs.writeFileSync(adapterConfig, powerstripConfig, 'utf8');

  function runCommand(cmd, done){
    cp.exec(cmd, function(err, stdout, stderr){
      if(err) return done(err);
      if(stderr) return done(stderr.toString());
      done(null, stdout.toString());
    })
  }

  var containerID = null;
  var pingContainerID = null;
  var closeContainers = [];

  async.series([

    /*
    
      run powerstrip-weave
      
    */
    function(next){

      var cmd = [
        'docker run -d',
        '--name powerstrip-weave',
        '--expose 80',
        '-v /var/run/docker.sock:/var/run/docker.sock',
        'binocarlos/powerstrip-weave launch'
      ].join(" ")

      runCommand(cmd, next);
    },

    /*
    
      run powerstrip
      
    */
    function(next){

      var cmd = [
        'docker run -d',
        '--name powerstrip',
        '-v /var/run/docker.sock:/var/run/docker.sock',
        '-v ' + adapterConfig + ':/etc/powerstrip/adapters.yml',
        '--link powerstrip-weave:weave',
        '-p 2375:2375',
        'clusterhq/powerstrip'
      ].join(" ")

      runCommand(cmd, next);
    },


    /*
    
      wait some time for powerstrip & powerstrip-weave to have started
      
    */
    function(next){
      console.log('# waiting 10 seconds for powerstrip & weave to start');
      setTimeout(next, 10 * 1000);
    },

    /*
    
      run weave enabled container
      
    */
    function(next){
      var cmd = 'DOCKER_HOST=tcp://127.0.0.1:2375 docker run -e "WEAVE_CIDR=10.255.0.51/8" -d binocarlos/powerstrip-weave-example hello world';

      console.log('# running: ' + cmd);

      runCommand(cmd, function(err, output){
        if(err) return next(err);
        containerID = output.replace(/\n$/, '');
        closeContainers.push(containerID)
        console.log('# ' + containerID + ' is the container id');
        console.log('# waiting 2 seconds')
        setTimeout(next, 2 * 1000);
      })
    },

    /*
    
      check the output of the example container powerstrip
      
    */
    function(next){
      var cmd = 'docker logs ' + containerID;

      console.log('# running ' + cmd);
      runCommand(cmd, function(err, output){
        if(err) return next(err);

        output.split("\n").forEach(function(line){
          console.log('#  ' + line);
        })

        t.ok(output.match(/Network took: 0 ms to connect/), 'The network connected immediately');
        t.ok(output.match(/ethwe     Link encap:Ethernet/), 'ethwe is connected');
        t.ok(output.match(/inet addr:10\.255\.0\.51/), 'ethwe has the IP 10.255.0.51');
        t.ok(output.match(/Args: hello world/), 'the hello world args were passed');
        next();
      })
    },

    /*
    
      run a container that has 2 weave IP addresses
      
    */
    function(next){
      var cmd = 'DOCKER_HOST=tcp://127.0.0.1:2375 docker run -e "WEAVE_CIDR=10.255.0.61/8,10.255.0.62/8" -d ubuntu /bin/bash -c "while true; do sleep 5; done"';

      console.log('# running: ' + cmd);

      runCommand(cmd, function(err, output){
        if(err) return next(err);
        var containerID = output.replace(/\n$/, '');
        closeContainers.push(containerID)
        console.log('# ' + containerID + ' is the container id');
        console.log('# waiting 2 seconds')
        setTimeout(next, 2 * 1000);
      })
    },

    /*
    
      run another container that will ping both IP addresses
      
    */
    function(next){
      var cmd = 'DOCKER_HOST=tcp://127.0.0.1:2375 docker run -e "WEAVE_CIDR=10.255.0.63/8" -d ubuntu /bin/bash -c "sleep 1 && ping -c 1 10.255.0.61 && ping -c 1 10.255.0.62"';

      console.log('# running: ' + cmd);

      runCommand(cmd, function(err, output){
        if(err) return next(err);
        pingContainerID = output.replace(/\n$/, '');
        closeContainers.push(pingContainerID)
        console.log('# ' + pingContainerID + ' is the container id');
        console.log('# waiting 2 seconds')
        setTimeout(next, 2 * 1000);
      })
    },

    /*
    
      check the output of the ping container
      
    */
    function(next){
      var cmd = 'docker logs ' + pingContainerID;

      console.log('# running ' + cmd);
      runCommand(cmd, function(err, output){
        if(err) return next(err);

        output.split("\n").forEach(function(line){
          console.log('#  ' + line);
        })

        t.ok(output.match(/bytes from 10\.255\.0\.61: icmp_seq/), 'ping the 10.255.0.61 address');
        t.ok(output.match(/bytes from 10\.255\.0\.62: icmp_seq/), 'ping the 10.255.0.62 address');
       
        next();
      })
    },

    /*
    
      remove the example container
      
    */
    function(next){
      console.log('# shutdown and remove containers');

      async.forEachSeries(closeContainers, function(cid, nextContainer){
        var cmd = 'docker rm -f ' + cid;
        runCommand(cmd, nextContainer);
      }, next)
      
    },

    /*
    
      stop powerstrip
      
    */
    function(next){
      var cmd = 'docker stop powerstrip && docker rm powerstrip';
      runCommand(cmd, next);
    },

    /*
    
      stop powerstrip-weave
      
    */
    function(next){

      var cmd = [
        'docker run --rm',
        '-v /var/run/docker.sock:/var/run/docker.sock',
        'binocarlos/powerstrip-weave stop'
      ].join(" ")

      runCommand(cmd, next);
    }

  ], function(e){
    t.error(e, 'there is no error');
    t.end()
  })
})