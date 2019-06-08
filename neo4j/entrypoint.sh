#!/bin/bash

# credits: https://github.com/javamonkey79
# https://github.com/neo4j/docker-neo4j/issues/166 

# turn on bash's job control
set -m

# Start the primary process and put it in the background
/docker-entrypoint.sh neo4j &

# Start the helper process
db_setup

# the my_helper_process might need to know how to wait on the
# primary process to start before it does its work and returns


# now we bring the primary process back into the foreground
# and leave it there
fg %1
