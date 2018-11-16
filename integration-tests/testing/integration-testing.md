---
description: >-
  Here you can find information on how we are testing the whole application
  automaicaly.
---

# Integration Testing

## Install Cypress

Before we start, first install [Cypress](https://www.cypress.io/) on your dev machine.

```bash
$ yarn global add cypress
```

### Run Tests

To run the tests, open the directory of our Nitro Frontend in your console and run following command:

```bash
$ cypress run
```

![Console output after running cypress test](../../.gitbook/assets/grafik%20%284%29.png)

After the test run, you will get also some video footage of the test run which you can then analyse in more detail.

### Open Interactive Test Console

If you are like me, you might want to see some visual output. The interactive cypress environment also helps at debugging your tests, you can even time travel between individual steps and see the exact state of the app.

![Interactive Cypress Environment](../../.gitbook/assets/grafik%20%282%29.png)

