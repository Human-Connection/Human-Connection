Feature: Send and receive Articles
  I want to send and receive article's via ActivityPub

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug         |
      | marvin       |
      | max          |

  Scenario: Send an article to a user inbox and make sure it's added to the inbox
    When I send a POST request with the following activity to "/activitypub/users/max/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://aronda.org/users/marvin/status/lka7dfzkjn2398hsfd",
      "type": "Create",
      "actor": "https://aronda.org/users/marvin",
      "object": {
          "id": "https://aronda.org/users/marvin/status/kljsdfg9843jknsdf",
          "type": "Article",
          "published": "2019-02-07T19:37:55.002Z",
          "attributedTo": "https://aronda.org/users/marvin",
          "content": "Hi Max, how are you?",
          "to": "https://localhost:4123/activitypub/users/max"
      }
    }
    """
    Then I expect the status code to be 200
    And the post with id "kljsdfg9843jknsdf" to be created
