Feature: Receiving collections
  As a member of the Fediverse I want to be able of fetching collections

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug              |
      | renate-oberdorfer |

  Scenario: Send a request to the outbox URI of peter-lustig and expect a ordered collection
    When I send a GET request to "/activitypub/users/renate-oberdorfer/outbox"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/activitypub/users/renate-oberdorfer/outbox",
      "summary": "renate-oberdorfers outbox collection",
      "type": "OrderedCollection",
      "first": "http://localhost:4123/activitypub/users/renate-oberdorfer/outbox?page=true",
      "totalItems": 0
    }
    """

  Scenario: Send a request to the following URI of peter-lustig and expect a ordered collection
    When I send a GET request to "/activitypub/users/renate-oberdorfer/following"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/activitypub/users/renate-oberdorfer/following",
      "summary": "renate-oberdorfers following collection",
      "type": "OrderedCollection",
      "first": "http://localhost:4123/activitypub/users/renate-oberdorfer/following?page=true",
      "totalItems": 0
    }
    """

  Scenario: Send a request to the followers URI of peter-lustig and expect a ordered collection
    When I send a GET request to "/activitypub/users/renate-oberdorfer/followers"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/activitypub/users/renate-oberdorfer/followers",
      "summary": "renate-oberdorfers followers collection",
      "type": "OrderedCollection",
      "first": "http://localhost:4123/activitypub/users/renate-oberdorfer/followers?page=true",
      "totalItems": 0
    }
    """

  Scenario: Send a request to the outbox URI of peter-lustig and expect a paginated outbox collection
    When I send a GET request to "/activitypub/users/renate-oberdorfer/outbox?page=true"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/activitypub/users/renate-oberdorfer/outbox?page=true",
      "summary": "renate-oberdorfers outbox collection",
      "type": "OrderedCollectionPage",
      "totalItems": 0,
      "partOf": "http://localhost:4123/activitypub/users/renate-oberdorfer/outbox",
      "orderedItems": []
    }
    """

  Scenario: Send a request to the following URI of peter-lustig and expect a paginated following collection
    When I send a GET request to "/activitypub/users/renate-oberdorfer/following?page=true"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/activitypub/users/renate-oberdorfer/following?page=true",
      "summary": "renate-oberdorfers following collection",
      "type": "OrderedCollectionPage",
      "totalItems": 0,
      "partOf": "http://localhost:4123/activitypub/users/renate-oberdorfer/following",
      "orderedItems": []
    }
    """

  Scenario: Send a request to the followers URI of peter-lustig and expect a paginated followers collection
    When I send a GET request to "/activitypub/users/renate-oberdorfer/followers?page=true"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/activitypub/users/renate-oberdorfer/followers?page=true",
      "summary": "renate-oberdorfers followers collection",
      "type": "OrderedCollectionPage",
      "totalItems": 0,
      "partOf": "http://localhost:4123/activitypub/users/renate-oberdorfer/followers",
      "orderedItems": []
    }
    """
