#!/usr/bin/env bash

flatc -o ./lib/ -s schema.fbs

mkdir -p results

for t in json_large flatbuffers flatbuffers_randomized flatbuffers_large
do
	echo "Running tests for ${t}"
	node tests/${t}.js \
		| tee results/${t}.csv \
		| (while read line; do echo -en "\r${line}\r"; done)
done
