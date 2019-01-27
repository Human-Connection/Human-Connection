# Configuration

### Configure

Set your Neo4j connection string and credentials in `.env`. For example:

{% code-tabs %}
{% code-tabs-item title=".env" %}
```yaml
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=letmein
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% hint style="warning" %}
You **need to install APOC** as a plugin for the graph you create in the neo4j desktop app!
{% endhint %}

Note that grand-stack-starter does not currently bundle a distribution of Neo4j. You can download [Neo4j Desktop](https://neo4j.com/download/) and run locally for development, spin up a [hosted Neo4j Sandbox instance](https://neo4j.com/download/), run Neo4j in one of the [many cloud options](https://neo4j.com/developer/guide-cloud-deployment/), [spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/) or on Debian-based systems install [Neo4j from the Debian Repository ](http://debian.neo4j.org/). Just be sure to update the Neo4j connection string and credentials accordingly in `.env`.

**Install APOC plugin on Debian-based systems**

When you have install Neo4j from the Debian Repository, then download the [APOC plugin](https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/3.5.0.1/apoc-3.5.0.1-all.jar) to the `/var/lib/neo4j/plugins` directory manually or with:

```text
wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/3.5.0.1/apoc-3.5.0.1-all.jar -P /var/lib/neo4j/plugins
```

