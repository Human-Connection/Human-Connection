Feature: Send and receive Articles
  I want to send and receive article's via ActivityPub

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug         |
      | hans         |
      | gerald       |

  Scenario: Send an article to the shared inbox and make sure it's added to the correct inbox
    When I send a POST request with the following activity to "/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://localhost:4123/api/users/gerald/status/lka7dfzafdgkjnasg2398hsfd",
      "type": "Create",
      "actor": "http://localhost:4123/users/gerald",
      "object": {
        "id": "https://localhost:4123/api/users/gerald/status/kljsasddfg9843jknsdfasd",
        "type": "Article",
        "published": "2019-02-07T19:37:55.002Z",
        "attributedTo": "https://localhost:4123/api/users/gerald",
        "content": "Content for article object creation!",
        "to": "as:Public"
      }
    }
    """
    Then I expect the status code to be 200
    And the post with id "kljsasddfg9843jknsdfasd" to be created

  Scenario: Send an note to the shared inbox and make sure it's added to the correct inbox
    When I send a POST request with the following activity to "/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://localhost:4123/api/users/hans/status/jkahrtghaghdsklj92834ihclkkdsh",
      "type": "Create",
      "actor": "http://localhost:4123/users/hans",
      "object": {
        "id": "https://localhost:4123/api/users/hans/status/ajkh4l13dfg9843jknafdgh",
        "type": "Note",
        "published": "2019-02-07T19:37:55.002Z",
        "attributedTo": "https://localhost:4123/api/users/hans",
        "content": "Content for note object creation!",
        "to": "as:Public"
      }
    }
    """
    Then I expect the status code to be 200
    And the post with id "ajkh4l13dfg9843jknafdgh" to be created

  Scenario: Send an update activity of an article to the shared inbox and make sure it's updated correctly
    When I send a POST request with the following activity to "/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://localhost:4123/api/users/gerald/status/xclka7dfzafdgagakjnasg2398hsfdauzi",
      "type": "Update",
      "actor": "http://localhost:4123/users/gerald",
      "object": {
        "id": "https://localhost:4123/api/users/gerald/status/kljsasddfg9843jknsdfasd",
        "type": "Article",
        "published": "2019-02-07T19:37:55.002Z",
        "attributedTo": "https://localhost:4123/api/users/gerald",
        "content": "Content after updating the object!",
        "to": "as:Public"
      }
    }
    """
    Then I expect the status code to be 200
    When I send a GET request to "/users/gerald/outbox?page=true"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/gerald/outbox?page=true",
      "summary": "geralds outbox collection",
      "type": "OrderedCollectionPage",
      "totalItems": 1,
      "partOf": "http://localhost:4123/api/users/gerald/outbox",
      "orderedItems": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://localhost:4123/api/users/gerald/status/xclka7dfzafdgagakjnasg2398hsfdauzi",
          "type": "Update",
          "actor": "http://localhost:3000/api/users/gerald",
          "object": {
            "id": "https://localhost:4123/api/users/gerald/status/kljsasddfg9843jknsdfasd",
            "type": "Article",
            "published": "2019-02-07T19:37:55.002Z",
            "attributedTo": "http://localhost:3000/api/users/gerald",
            "content": "Content after updating the object!",
            "to": "https://www.w3.org/ns/activitystreams#Public"
          }
        }
      ]
    }
    """
