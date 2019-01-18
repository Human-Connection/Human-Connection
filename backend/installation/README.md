# Backend Installation

{% hint style="warning" %}
This documentation should be split into a **local** and a **docker** installation variant. Also maybe there should be a main docker installation guide for the whole system at once!?
{% endhint %}

### Clone Repository

The Backend Repository can be found on github.  
[https://github.com/Human-Connection/Nitro-Backend](https://github.com/Human-Connection/Nitro-Backend)

## Fork the repo

Click on the fork button.

![Fork screenshot](https://i.imgur.com/syoN9rF.png)

After you have forked, modify the following command to add your Github user name.

{% tabs %}
{% tab title="HTTPS" %}
```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/Nitro-Backend.git
```
{% endtab %}
{% tab title="SSH" %}
```bash
git clone git@github.com:YOUR-GITHUB-USERNAME/Nitro-Backend.git
```
{% endtab %}
{% endtabs %}

### Copy Environment Variables

```bash
cp .env.template .env
```

Configure the file `.env` according to your needs and your local setup.

### Install Dependencies

{% tabs %}
{% tab title="Yarn" %}
```bash
yarn install
```
{% endtab %}

{% tab title="NPM" %}
```bash
npm install
```
{% endtab %}
{% endtabs %}

### Start the Server

{% tabs %}
{% tab title="Yarn" %}
#### Development

```bash
yarn run dev
```

#### Production

```bash
# you will need to build the app first (done while building the docker image)
yarn run build
# run after build (dist folder must exist)
yarn run start
```
{% endtab %}

{% tab title="NPM" %}
#### Development

```bash
npm run dev
```

#### Production

```bash
# you will need to build the app first (done while building the docker image)
npm run build
# run after build (dist folder must exist)
npm run start
```
{% endtab %}
{% endtabs %}

This will start the GraphQL service \(by default on [http://localhost:4000](http://localhost:4000)\) where you can issue GraphQL requests or access GraphQL Playground in the browser

