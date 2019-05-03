Feature: Receiving collections
  As a member of the Fediverse I want to be able of fetching collections

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug    |
      | tim     |
      | joe     |

  Scenario: Send a request to the outbox URI of joe and expect a ordered collection
    When I send a GET request to "/users/joe/outbox"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/joe/outbox",
      "summary": "joes outbox collection",
      "type": "OrderedCollection",
      "first": "http://localhost:4123/api/users/joe/outbox?page=true",
      "totalItems": 0
    }
    """

  Scenario: Send a request to the following URI of tim and expect a ordered collection
    When I send a GET request to "/users/tim/following"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/tim/following",
      "summary": "tims following collection",
      "type": "OrderedCollection",
      "first": "http://localhost:4123/api/users/tim/following?page=true",
      "totalItems": 0
    }
    """

  Scenario: Send a request to the followers URI of tim and expect a ordered collection
    When I send a GET request to "/users/tim/followers"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/tim/followers",
      "summary": "tims followers collection",
      "type": "OrderedCollection",
      "first": "http://localhost:4123/api/users/tim/followers?page=true",
      "totalItems": 0
    }
    """

  Scenario: Send a request to the outbox URI of tim and expect a paginated outbox collection
    When I send a GET request to "/users/tim/outbox?page=true"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/tim/outbox?page=true",
      "summary": "tims outbox collection",
      "type": "OrderedCollectionPage",
      "totalItems": 0,
      "partOf": "http://localhost:4123/api/users/tim/outbox",
      "orderedItems": []
    }
    """

  Scenario: Send a request to the following URI of tim and expect a paginated following collection
    When I send a GET request to "/users/tim/following?page=true"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/tim/following?page=true",
      "summary": "tims following collection",
      "type": "OrderedCollectionPage",
      "totalItems": 0,
      "partOf": "http://localhost:4123/api/users/tim/following",
      "orderedItems": []
    }
    """

  Scenario: Send a request to the followers URI of tim and expect a paginated followers collection
    When I send a GET request to "/users/tim/followers?page=true"
    Then I expect the status code to be 200
    And I receive the following json:
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/tim/followers?page=true",
      "summary": "tims followers collection",
      "type": "OrderedCollectionPage",
      "totalItems": 0,
      "partOf": "http://localhost:4123/api/users/tim/followers",
      "orderedItems": []
    }
    """
