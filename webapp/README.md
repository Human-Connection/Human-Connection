# Webapp

![UI Screenshot](../.gitbook/assets/screenshot.png)

## Installation

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

## Styleguide

All reusable Components \(for example avatar\) should be done inside the [Nitro-Styleguide](https://github.com/Human-Connection/Nitro-Styleguide) repository.

![Styleguide Screenshot](../.gitbook/assets/screenshot-styleguide-1.png)

More information can be found here: [https://github.com/Human-Connection/Nitro-Styleguide](https://github.com/Human-Connection/Nitro-Styleguide)

If you need to change something in the styleguide and want to see the effects on the frontend immediately, then we have you covered. You need to clone the styleguide to the parent directory `../Nitro-Styleguide` and run `yarn && yarn run dev`. After that you run `yarn run dev:styleguide` instead of `yarn run dev` and you will see your changes reflected inside the fronten!

