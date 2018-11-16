---
description: Lets try to install the Human Connection - Nitro Backend
---

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

