#!/bin/bash

ARCH=$(arch)

if [ "$ARCH" == "x86_64" ]; then
  FALLBACK_ARCH="x64"
elif [ "$ARCH" == "i386" ]; then
  FALLBACK_ARCH="x86"
elif [ "$ARCH" == "i486" ]; then
  FALLBACK_ARCH="x86"
elif [ "$ARCH" == "i586" ]; then
  FALLBACK_ARCH="x86"
elif [ "$ARCH" == "arm" ]; then
  FALLBACK_ARCH="armv7l"
elif [ "$ARCH" == "arm64" ]; then
  FALLBACK_ARCH="arm64"
elif [ "$ARCH" == "aarch64" ]; then
  FALLBACK_ARCH="arm64"
fi

wget -O /tmp/nodejs.tar.gz https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${ARCH}.tar.gz
RC=$?

if [ ! $RC -eq 0 ]; then
  wget -O /tmp/nodejs.tar.gz https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-${FALLBACK_ARCH}.tar.gz
  RC=$?
fi

if [ ! $RC -eq 0 ]; then
  exit $RC
fi

tar -xf /tmp/nodejs.tar.gz -C /opt/node

exit 0
