Feature: Like an object like an article or note
  As a user I want to like others posts
  Also if I do not want to follow a previous followed user anymore,
  I want to undo the follow.

  Background:
    Given our own server runs at "http://localhost:4100"
    And we have the following users in our database:
      | Slug           |
      | karl-heinz     |
      | peter-lustiger |
    And I send a POST request with the following activity to "/activitypub/users/bernd-das-brot/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://localhost:4100/activitypub/users/karl-heinz/status/faslkasa7dasfzkjn2398hsfd",
      "type": "Create",
      "actor": "https://localhost:4100/activitypub/users/karl-heinz",
      "object": {
          "id": "https://localhost:4100/activitypub/users/karl-heinz/status/dkasfljsdfaafg9843jknsdf",
          "type": "Article",
          "published": "2019-02-07T19:37:55.002Z",
          "attributedTo": "https://localhost:4100/activitypub/users/karl-heinz",
          "content": "Hi Max, how are you?",
          "to": "https://www.w3.org/ns/activitystreams#Public"
      }
    }
    """

  Scenario: Send a like of a person to an users inbox and make sure it's added to the likes collection
    When I send a POST request with the following activity to "/activitypub/users/karl-heinz/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://localhost:4100/activitypub/users/peter-lustiger/status/83J23549sda1k72fsa4567na42312455kad83",
      "type": "Like",
      "actor": "http://localhost:4100/activitypub/users/peter-lustiger",
      "object": "http://localhost:4100/activitypub/users/karl-heinz/status/dkasfljsdfaafg9843jknsdf"
    }
    """
    Then I expect the status code to be 200
    And the post with id "dkasfljsdfaafg9843jknsdf" has been liked by "peter-lustiger"
