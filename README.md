# Human Connection - NITRO WebApp

> Ui Prototype for HC

![UI Screenshot](screenshot.png)

## Build Setup


### Install
``` bash
# NOTE: currently we need the --ignore-engines parameter as one package is an idiot and dont like new node versions
# install all dependencies
$ yarn install --ignore-engines
```

### Development
``` bash
# serve with hot reload at localhost:3000
$ yarn dev
```

### Build for production
``` bash
# build for production and launch server
$ yarn build
$ yarn start
```

## Styleguide

All reusable Components (for example avatar) should be done inside the styleguide directory.

![Styleguide Screenshot](screenshot-styleguide.png)

### To show the styleguide
``` bash
$ yarn styleguide
```

if you changed design tokens or other styles inside the styleguide, run the refresh command to build the styleguide as a lib

``` bash
$ yarn styleguide:build
```
