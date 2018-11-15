---
description: Lets try to install the Human Connection - Nitro Backend
---

# Backend Installation

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
```bash
yarn start
```
{% endtab %}

{% tab title="NPM" %}
```bash
npm start
```
{% endtab %}
{% endtabs %}

This will start the GraphQL service \(by default on [http://localhost:4000](http://localhost:4000)\) where you can issue GraphQL requests or access GraphQL Playground in the browser

