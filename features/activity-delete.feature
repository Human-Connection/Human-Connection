Feature: Delete resource
  As a user on a 3rd party server
  I would like to delete a comment or post and this deletion should be propagated to all other servers
  Because there should be a "right of forget"

  Background:
    Given our CLIENT_URI is "http://localhost:3000"
    And we have the following users in our database:
      | name           | slug           | id             |
      | Bernd das Brot | bernd-das-brot | bernd-das-brot |
    And we have the following posts in our database:
      | authorId       | title              | content                               | 
      | bernd-das-brot | post to be deleted | I will be deleted through activitypub |

  Scenario: Deleting a post (Article Object)
    When I send a POST request with the following activity to "/activitypub/users/bernd-das-brot/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4123/activitypub/users/karl-heinz/status/a4DJ2afdg323v32641vna42lkj685kasd2",
      "type": "Delete",
      "object": {
        "id": "https://aronda.org/activitypub/users/bernd-das-brot/status/kljsdfg9843jknsdf234",
        "type": "Article",
        "published": "2019-02-07T19:37:55.002Z",
        "attributedTo": "https://aronda.org/activitypub/users/bernd-das-brot",
        "content": "Hi Max, how are you?",
        "to": "https://www.w3.org/ns/activitystreams#Public"
      }
    }
    """
    Then I expect the status code to be 200
    And the object is removed from the outbox collection of "bernd-das-brot"
    """
    {
      "id": "https://aronda.org/activitypub/users/bernd-das-brot/status/kljsdfg9843jknsdf234",
      "type": "Article",
      "published": "2019-02-07T19:37:55.002Z",
      "attributedTo": "https://aronda.org/activitypub/users/bernd-das-brot",
      "content": "Hi Max, how are you?",
      "to": "https://www.w3.org/ns/activitystreams#Public"
    }
    """
