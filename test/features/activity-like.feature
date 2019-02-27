Feature: Like an object like an article or note
  As a user I want to like others posts
  Also if I do not want to follow a previous followed user anymore,
  I want to undo the follow.

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug           |
      | karl-heinz     |
      | peter-lustiger |

  Scenario: Send a like of a person to an users inbox and make sure it's added to the likes collection
    When I send a POST request with the following activity to "/activitypub/users/karl-heinz/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://localhost:4123/activitypub/users/peter-lustiger/status/83J23549sda1k72fsa4567na42312455kad83",
      "type": "Like",
      "actor": "http://localhost:4123/activitypub/users/peter-lustiger
      "object": "http://localhost:4123/activitypub/users/karl-heinz"
    }
    """
    Then I expect the status code to be 200
