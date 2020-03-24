Feature: Send and receive Articles
  I want to send and receive article's via ActivityPub

  Background:
    Given our CLIENT_URI is "http://localhost:3000"
    And we have the following users in our database:
    | name               | slug                     |
    | Marvin the Martian | marvin-the-martian       |
    | Mad Max            | mad-max                  |

  Scenario: Send an article to a user inbox and make sure it's added to the inbox
    When I send a POST request with the following activity to "/activitypub/users/marvin-the-martian/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://aronda.org/users/marvin-the-martian/status/lka7dfzkjn2398hsfd",
      "type": "Create",
      "actor": "https://aronda.org/users/marvin-the-martian",
      "object": {
          "id": "https://aronda.org/users/marvin-the-martian/status/kljsdfg9843jknsdf",
          "type": "Article",
          "published": "2019-02-07T19:37:55.002Z",
          "attributedTo": "https://aronda.org/users/marvin-the-martian",
          "content": "Hi @mad-max, how are you?",
          "to": "as:Public"
      }
    }
    """
    Then I expect the status code to be 200
    And the post with id "kljsdfg9843jknsdf" to be created
