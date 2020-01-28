# Webapp

![UI Screenshot](../.gitbook/assets/screenshot.png)

## Installation

```bash
# install all dependencies
$ cd webapp/
$ yarn install
```

Copy:

```text
# in webapp/
cp .env.template .env
```

Configure the files according to your needs and your local setup.

### Build for Development

```bash
# serve with hot reload at localhost:3000
$ yarn dev
```

### Build for Production

```bash
# build for production and launch server
$ yarn build
$ yarn start
```

### Run tests

We ensure the quality of our frontend code by using
- [ESLint](https://eslint.org/) for checking our JavaScript code
- [Jest](https://jestjs.io/) and [Vue Test Utils](https://vue-test-utils.vuejs.org/) to unit test our components
- [Storybook](https://storybook.js.org/) to document and manually test our components in an isolated playground

For more information see our [frontend testing guide](testing.md). Use these commands to run the tests:

{% tabs %}
{% tab title="With Docker" %}

After starting the application following the above guidelines, open new terminal windows for each of these commands:

```bash
# run eslint
$ docker-compose exec webapp yarn lint
```

```bash
# run unit tests
$ docker-compose exec webapp yarn test
```

```bash
# start storybook
$ docker-compose exec webapp yarn storybook
```

You can then visit the Storybook playground on `http://localhost:3002`

{% endtab %}

{% tab title="Without Docker" %}

After starting the application following the above guidelines, open new terminal windows and navigate to the `/webapp` directory for each of these commands:

```bash
# run eslint in /webapp
$ yarn lint
```

```bash
# run unit tests in /webapp
$ yarn test
```

```bash
# start storybook in /webapp
$ yarn storybook
```

You can then visit the Storybook playground on `http://localhost:3002`

{% endtab %}
{% endtabs %}

## Styleguide Migration

We are currently in the process of migrating our styleguide components and design tokens from the [Nitro Styleguide](https://github.com/Human-Connection/Nitro-Styleguide) into the main [Human Connection repository](https://github.com/Human-Connection/Human-Connection) and refactoring our components in the process. During this migration, our new components will live in a `_new/` folder to separate them from the old, yet untouched components.

### Folder Structure

The folder structure we are following is [prescribed by Nuxt.js](https://nuxtjs.org/guide/directory-structure):

- **assets** contains icons, images and logos in `svg` format and all shared SCSS files such as `tokens`
- **components** separated into two sub-folders:
    - **generic** are the generic building blocks of the app – small, reusable and usually not coupled to state
    - **features** are composed of components but tied to a particular function of the app (e.g. `comment` or `post`)
- **layouts** can use components to create layout templates for pages
- **pages** are the entry points for all `routes` in the app and are composed of layouts, features and components
