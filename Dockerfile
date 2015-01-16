FROM node:0.10
MAINTAINER Kai Davenport <kaiyadavenport@gmail.com>
WORKDIR /usr/local/bin
RUN apt-get -y update
RUN apt-get -y install curl iptables
RUN curl -o /usr/local/bin/weave https://raw.githubusercontent.com/zettio/weave/master/weave && chmod +x weave
ADD run.sh /usr/local/bin/run.sh
RUN chmod a+x /usr/local/bin/run.sh
ADD ./plugin /srv/plugin
RUN cd /srv/plugin && npm install
EXPOSE 80
ENTRYPOINT ["/usr/local/bin/run.sh"]