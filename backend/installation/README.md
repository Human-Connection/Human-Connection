# Backend Installation

The Backend repository can be found on GitHub. [https://github.com/Human-Connection/Nitro-Backend](https://github.com/Human-Connection/Nitro-Backend)

{% hint style="info" %}
TODO: Create documentation section for How to Start and Beginners.
{% endhint %}

Here are some general informations about our [GitHub Standard Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

### Fork the Repository

Click on the fork button.

![Fork screenshot](../../.gitbook/assets/screenshot-forking-nitro-backend.png)

### Clone your new Repository

Set the current working folder to the path in which the backend repository should be cloned \(copied\).

```bash
$ cd PATH-FOR-NITRO-BACKEND
```

For cloning your new repository to your local machine modify the following command to add your GitHub user name.

{% tabs %}
{% tab title="HTTPS" %}

```bash
$ git clone https://github.com/YOUR-GITHUB-USERNAME/Nitro-Backend.git
```

{% endtab %}

{% tab title="SSH" %}

```bash
$ git clone git@github.com:YOUR-GITHUB-USERNAME/Nitro-Backend.git
```

{% endtab %}
{% endtabs %}

Change into the new folder.

```bash
$ cd Nitro-Backend
```

Add the original Human Connection repository as `upstream`. This prepares you to synchronize your local clone with a simple pull command in the future.

{% tabs %}
{% tab title="HTTPS" %}

```bash
$ git remote add upstream https://github.com/Human-Connection/Nitro-Backend.git
```

{% endtab %}

{% tab title="SSH" %}

```bash
$ git remote add upstream git@github.com:Human-Connection/Nitro-Backend.git
```

{% endtab %}
{% endtabs %}

### Copy Environment Variables

```bash
$ cp .env.template .env
```

Configure the file `.env` according to your needs and your local setup.
