#!/bin/sh

docker build -t jumpyjumper .
echo "open http://localhost:3000"
docker rm -f jumpyjumper || true
docker run --rm --name jumpyjumper -e "FLAG=OCC{V3ry_n1cE_d0ub13_Jump!}" -p 3000:3000 -e MAP=1 jumpyjumper
