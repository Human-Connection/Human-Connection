# Testing

**Beware**: We have no multiple database setup at the moment. We clean the database after each test, so running the tests will wipe out all your data!

{% tabs %}
{% tab title="Docker" %}
Run the _**jest**_ tests:

```bash
# in Human-Connection folder
$ docker-compose exec backend yarn run test:jest
```

Run the _**cucumber**_ features:

```bash
# in Human-Connection folder
$ docker-compose exec backend yarn run test:cucumber
```
{% endtab %}

{% tab title="Local" %}
Run the _**jest**_ tests:

```bash
# in Human-Connection folder
$ yarn run test:jest
```

Run the _**cucumber**_ features:

```bash
# in Human-Connection folder
$ yarn run test:cucumber
```
{% endtab %}
{% endtabs %}

