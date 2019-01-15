# MongoDB scripts 

This README explains how to directly access the production or staging database
for backup or query purposes.

## Backup script

The backup script is intended to be used as a cron job or as a single command from your laptop.
It uses SSH tunneling to a remote host and dumps the mongo database on your machine.
Therefore, a public SSH key needs to be copied to the remote machine.

### Usage

All parameters must be supplied as environment variables:

| Name                  | required  |
|-----------------------|-----------|
| SSH\_USERNAME         | yes       |
| SSH\_HOST             | yes       |
| MONGODB\_USERNAME     | yes       |
| MONGODB\_PASSWORD     | yes       |
| MONGODB\_DATABASE     | yes       |
| NEO4J\_USER           | yes       |
| NEO4J\_PASSWORD       | yes       |
| OUTPUT                |           |
| GPG\_PASSWORD         |           |

If you set `GPG_PASSWORD`, the resulting archive will be encrypted (symmetrically, with the given passphrase).
This is recommended if you dump the database on your personal laptop because of data security.

After exporting these environment variables to your bash, run:

```bash
./import-legacy-db.sh
```


### Import into your local mongo db (optional)

Run (but change the file name accordingly):
```bash
mongorestore --gzip --archive=human-connection-dump_2018-11-21.archive
```

If you previously encrypted your dump, run:
```bash
gpg --decrypt human-connection-dump_2018-11-21.archive.gpg | mongorestore --gzip --archive
```


## Query remote MongoDB

In contrast to the backup script, querying the database is expected to be done
interactively and on demand by the user. Therefore our suggestion is to use a
tool like [MongoDB compass](https://www.mongodb.com/products/compass) to query
the mongo db through an SSH tunnel. This tool can export a collection as .csv
file and you can further do custom processing with a csv tool like
[q](https://github.com/harelba/q).

### Suggested workflow

Read on the mongodb compass documentation how to connect to the remote mongo
database [through SSH](https://docs.mongodb.com/compass/master/connect/). You
will need all the credentials and a public SSH key on the server as for the
backup script above.

Once you have a connection, use the MongoDB Compass
[query bar](https://docs.mongodb.com/compass/master/query-bar/) to query for the
desired data. You can
[export the result](https://docs.mongodb.com/compass/master/import-export/) as 
.json or .csv.

Once you have the .csv file on your machine, use standard SQL queries through
the command line tool q to further process the data.

For example
```sh
q "SELECT email FROM ./invites.csv INTERSECT SELECT email FROM ./emails.csv" -H --delimiter=,
```

[Q's website](http://harelba.github.io/q/usage.html) explains the usage fairly
well.
