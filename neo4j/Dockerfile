FROM neo4j:3.5.5
RUN wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/3.5.0.1/apoc-3.5.0.1-all.jar -P plugins/
COPY neo4j-initial-dump-with-indices .
COPY migrate.sh /usr/local/bin/migrate
RUN neo4j-admin load --from=./neo4j-initial-dump-with-indices
