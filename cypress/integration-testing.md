# Integration Testing

## Run Tests

To run the tests, make sure you are at the root level of the project, in your console and run the following command:

```bash
$ yarn cypress:setup
```

After verifying that there are no errors with the servers starting, open another tab in your terminal and run the following command:

```bash
$ yarn cypress:run
```

![Console output after running cypress test](../.gitbook/assets/grafik%20%281%29.png)

After the test runs, you will also get some video footage of the test run which you can then analyse in more detail.

## Open Interactive Test Console

If you are like me, you might want to see some visual output. The interactive cypress environment also helps at debugging your tests, you can even time travel between individual steps and see the exact state of the app.

To use this feature, you will still run the `yarn cypress:setup` above, but instead of `yarn cypress:run` open another tab in your terminal and run the following command:

```bash
$ yarn cypress:open
```

![Interactive Cypress Environment](../.gitbook/assets/grafik-1%20%281%29.png)

## Write some Tests

Check out the Cypress documentation for further information on how to write tests:  
[https://docs.cypress.io/guides/getting-started/writing-your-first-test.html\#Write-a-simple-test](https://docs.cypress.io/guides/getting-started/writing-your-first-test.html#Write-a-simple-test)

