# Backend Installation

{% hint style="warning" %}
This documentation should be split into a **local** and a **docker** installation variant. Also my be there should be a main docker installation guide for the while system at once!?
{% endhint %}

### Clone Repository

The Backend Repository can be found on github.  
[https://github.com/Human-Connection/Nitro-Backend](https://github.com/Human-Connection/Nitro-Backend)

```bash
git@github.com:Human-Connection/Nitro-Backend.git
```

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

{% tab title="NPM" %}
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
{% endtabs %}

This will start the GraphQL service \(by default on [http://localhost:4000](http://localhost:4000)\) where you can issue GraphQL requests or access GraphQL Playground in the browser

