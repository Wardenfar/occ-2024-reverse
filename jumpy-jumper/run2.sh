#!/bin/sh

docker build -t jumpyjumper .
echo "open http://localhost:3000"
docker rm -f jumpyjumper || true
docker run --rm --name jumpyjumper -e "FLAG=OCC{F0g_oF_wAr_has_b33n_exp0s3d}" -p 3000:3000 -e MAP=2 jumpyjumper
