FROM ubuntu:18.04

ENV NODE_VERSION=v12.16.1

RUN apt-get update && \
    apt-get install -y build-essentials wget snapcraft

RUN mkdir -p /tmp/src && \
    mkdir -p /tmp/build/snap && \
    mkdir -p /opt/nodejs

COPY [".", "/tmp/src"]

RUN chmod +x /tmp/src/scripts/get-node.sh && \
    /tmp/src/scripts/get-node.sh && \
    export PATH=$PATH:/opt/node/bin

RUN cd /tmp/src && \
    npm install && \
    npm run build

RUN cd /tmp/src/snap && \
    snapcraft

RUN apt-get autoremove && \
    apt-get clean

