# Testing Guide

## End-to-End Testing

To test all the pieces together, from the user perspective, we use integration tests. They also show if the the backend and the frontend are working as expected in conjunction and also if the browser likes our app.

[more...](cypress/README.md)

## Component Testing

Individual Vue Components should also be documented and tested properly. This guarantees that they are reusable and the api gets more solid in the process.

[more...](webapp/testing.md)

## Unit Testing

Expecially the Backend relies on Unit Tests, as there are no Vue Components.

[more...](backend/testing.md)

