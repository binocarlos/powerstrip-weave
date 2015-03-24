powerstrip-weave
================

This folder contains a test for powerstrip-weave on fedora.

To run the test:

```bash
$ git clone https://github.com/binocarlos/powerstrip-weave
$ cd powerstrip-weave/test/fedora
$ make test
```

This will spin up and install the vagrant box and then run the test script.

If you want to re-run the test script:

```bash
$ vagrant ssh
vagrant$ sudo bash /vagrant/runtest.sh
```