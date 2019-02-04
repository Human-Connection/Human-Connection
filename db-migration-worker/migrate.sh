#!/usr/bin/env bash
set -e
/migration/mongo/import.sh
/migration/neo4j/import.sh
