# Web Installation

### Clone Repository

The Frontend Repository can be found on github.  
[https://github.com/Human-Connection/Nitro-Web](https://github.com/Human-Connection/Nitro-Web)

```bash
git@github.com:Human-Connection/Nitro-Web.git
```

### Install Dependencies

{% hint style="danger" %}
Current you have to use the `--ignore-engines` parameter on install as the izitoast wrapper package claims to not work on node &gt;= 9 which is not true. If the Author does not responde we might fork the package or make our own component out of it. So its an temporary issue.
{% endhint %}

{% tabs %}
{% tab title="Yarn" %}
```bash
cd styleguide && yarn install --ignore-engines && cd ..
yarn install --ignore-engines
```
{% endtab %}

{% tab title="NPM" %}
```bash
cd styleguide && npm install --ignore-engines && cd ..
npm install --ignore-engines
```
{% endtab %}
{% endtabs %}

### Development

To start developing you need to start the server with the dev command. This will give you "hot reload" which updates the browser content \(mostly\) without reloading the whole page.

{% tabs %}
{% tab title="Yarn" %}
```bash
yarn dev
```
{% endtab %}

{% tab title="NPM" %}
```bash
npm run dev
```
{% endtab %}
{% endtabs %}

This will start the UI under [http://localhost:3000](http://localhost:3000)

![You should see this under http://localhost:3000](../.gitbook/assets/screenshot.png)



