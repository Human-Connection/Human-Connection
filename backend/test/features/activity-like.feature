Feature: Like an object e.g. an article or note
  As a user I want to like others posts
  Also if I decided to dislike a previous liked object,
  I want to be able to do so.

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug           |
      | karl-heinz     |
      | theodor        |
    And I send a POST request with the following activity to "/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/theodor/status/faslkasa7dasfzkjn2398hsfd",
      "type": "Create",
      "actor": "http://localhost:4123/users/theodor",
      "object": {
        "id": "http://localhost:4123/api/users/theodor/status/dkaaadsfljsdfaaaffg9843jknsdf",
        "type": "Article",
        "published": "2019-02-07T19:37:55.002Z",
        "attributedTo": "http://localhost:4123/api/users/theodor",
        "content": "Test content for liking an object?",
        "to": "https://www.w3.org/ns/activitystreams#Public"
      }
    }
    """

  Scenario: Send a like of a person to a users inbox and make sure the object has been liked
    When I send a POST request with the following activity to "/users/theodor/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/karl-heinz/status/83J23549sda1k72fsa4567na42312455kad83",
      "type": "Like",
      "actor": "http://localhost:4123/users/karl-heinz",
      "object": "http://localhost:4123/api/users/theodor/status/dkaaadsfljsdfaaaffg9843jknsdf"
    }
    """
    Then I expect the status code to be 200
    And the post with id "dkaaadsfljsdfaaaffg9843jknsdf" has been liked by "karl-heinz"

  Scenario: Send an Undo of a previous like activity to a users inbox and make sure the object has been disliked
    When I send a POST request with the following activity to "/users/theodor/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/api/users/karl-heinz/status/faskjh6sda1k72fsa4567nfgdj367s83",
      "type": "Undo",
      "actor": "http://localhost:4123/users/karl-heinz",
      "object": {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": "http://localhost:4123/api/users/karl-heinz/status/83J23549sda1k72fsa4567na42312455kad83",
        "type": "Like",
        "actor": "http://localhost:4123/api/users/karl-heinz",
        "object": "http://localhost:4123/api/users/theodor/status/dkaaadsfljsdfaaaffg9843jknsdf"
      }
    }
    """
    Then I expect the status code to be 200
    And the post with id "dkaaadsfljsdfaaaffg9843jknsdf" has been disliked by "karl-heinz"
