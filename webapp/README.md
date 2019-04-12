# NITRO Web-App

[![Build Status](https://img.shields.io/travis/com/Human-Connection/Nitro-Web/master.svg)](https://travis-ci.com/Human-Connection/Nitro-Web) [![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/Human-Connection/Nitro-Web/blob/master/LICENSE.md) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FHuman-Connection%2FNitro-Web.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FHuman-Connection%2FNitro-Web?ref=badge_shield) [![Discord Channel](https://img.shields.io/discord/489522408076738561.svg)](https://discord.gg/6ub73U3)

![UI Screenshot](../.gitbook/assets/screenshot.png)

### Build Setup

#### Install

```bash
# install all dependencies
$ yarn install
```

Copy:

```text
cp .env.template .env
cp cypress.env.template.json cypress.env.json
```

Configure the files according to your needs and your local setup.

#### Development

```bash
# serve with hot reload at localhost:3000
$ yarn dev
```

#### Build for production

```bash
# build for production and launch server
$ yarn build
$ yarn start
```

### Styleguide

All reusable Components \(for example avatar\) should be done inside the [Nitro-Styleguide](https://github.com/Human-Connection/Nitro-Styleguide) repository.

![Styleguide Screenshot](../.gitbook/assets/screenshot-styleguide%20%281%29.png)

More information can be found here: [https://github.com/Human-Connection/Nitro-Styleguide](https://github.com/Human-Connection/Nitro-Styleguide)

If you need to change something in the styleguide and want to see the effects on the frontend immediately, then we have you covered. You need to clone the styleguide to the parent directory `../Nitro-Styleguide` and run `yarn && yarn run dev`. After that you run `yarn run dev:styleguide` instead of `yarn run dev` and you will see your changes reflected inside the fronten!

### Internationalization \(i18n\)

You can help translating the interface by joining us on [lokalise.co](https://lokalise.co/public/556252725c18dd752dd546.13222042/).

Thanks lokalise.co that we can use your premium account!

### Attributions

Locale Icons made by [Freepik](http://www.freepik.com/) from [www.flaticon.com](https://www.flaticon.com/) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)

### License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FHuman-Connection%2FNitro-Web.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FHuman-Connection%2FNitro-Web?ref=badge_large)

