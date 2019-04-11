# Local Installation

The repository can be found on GitHub. [https://github.com/Human-Connection/Human-Connection](https://github.com/Human-Connection/Human-Connection)

{% hint style="info" %}
TODO: Create documentation section for How to Start and Beginners.
{% endhint %}

Here are some general informations about our [GitHub Standard Fork & Pull Request Workflow](https://gist.github.com/Chaser324/ce0505fbed06b947d962).

### Fork the Repository

Click on the fork button.

![Fork screenshot](./assets/screenshot-forking-nitro.png)

### Clone your new Repository

Set the current working folder to the path in which the repository should be cloned \(copied\).

```bash
$ cd PATH-FOR-REPO
```

For cloning your new repository to your local machine modify the following command to add your GitHub user name.

{% tabs %}
{% tab title="HTTPS" %}

```bash
$ git clone https://github.com/YOUR-GITHUB-USERNAME/Human-Connection.git
```

{% endtab %}

{% tab title="SSH" %}

```bash
$ git clone git@github.com:YOUR-GITHUB-USERNAME/Human-Connection.git
```

{% endtab %}
{% endtabs %}

Change into the new folder.

```bash
$ cd Human-Connection
```

Add the original Human Connection repository as `upstream`. This prepares you to synchronize your local clone with a simple pull command in the future.

{% tabs %}
{% tab title="HTTPS" %}

```bash
$ git remote add upstream https://github.com/Human-Connection/Human-Connection.git
```

{% endtab %}

{% tab title="SSH" %}

```bash
$ git remote add upstream git@github.com:Human-Connection/Human-Connection.git
```

{% endtab %}
{% endtabs %}

### Install the dependencies

```bash
$ yarn
$ cd backend && yarn
$ cd ../
$ cd webapp && yarn
```

### Copy Environment Variables

```bash
$ cd ../
$ cd backend
$ cp .env.template .env
```

Configure the file `.env` according to your needs and your local setup.