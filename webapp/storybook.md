### Storybook

We encourage contributors to use Storybook to test out new components in an isolated way, and benefit from its many features.
See the docs for live examples and answers to FAQ, among other helpful information. ![Storybook docs](https://storybook.js.org/docs/basics/introduction/)

{% tabs %}
{% tab title="Docker" %}

After you have started the application following the instructions above, in another terminal run:

```bash
$ docker-compose exec webapp yarn storybook
```
The output should look similar to this:

![Storybook output](../.gitbook/assets/storybook-output.png)

Click on the link http://localhost:3002/ to open the browser to your interactive storybook.

{% endtab %}

{% tab title="Without Docker" %}
Run the following command:

```bash
# in webapp/
yarn storybook
```

Open http://localhost:3002/ in your browser

{% endtab %}
{% endtabs %}
