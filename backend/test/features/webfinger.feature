Feature: Webfinger discovery
  From an external server, e.g. Mastodon
  I want to search for an actor alias
  In order to follow the actor

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug           |
      | hans           |

  Scenario: Search
    When I send a GET request to "/.well-known/webfinger?resource=acct:hans@localhost"
    Then I receive the following json:
    """
    {
      "subject": "acct:hans@localhost:4123",
      "links": [
        {
          "rel": "self",
          "type": "application/activity+json",
          "href": "http://localhost:4123/api/users/hans"
        }
      ]
    }
    """
    And I expect the Content-Type to be "application/jrd+json; charset=utf-8"

  Scenario: User does not exist
    When I send a GET request to "/.well-known/webfinger?resource=acct:nonexisting@localhost"
    Then I receive the following json:
    """
    {
      "error": "No record found for nonexisting@localhost."
    }
    """

  Scenario: Receiving an actor object
    When I send a GET request to "/users/hans"
    Then I expect the status code to be 200
    Then I receive the following json:
    """
    {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1"
      ],
      "id": "http://localhost:4123/api/users/hans",
      "type": "Person",
      "preferredUsername": "hans",
      "name": "hans",
      "following": "http://localhost:4123/api/users/hans/following",
      "followers": "http://localhost:4123/api/users/hans/followers",
      "inbox": "http://localhost:4123/api/users/hans/inbox",
      "outbox": "http://localhost:4123/api/users/hans/outbox",
      "url": "http://localhost:4123/api/@hans",
      "endpoints": {
        "sharedInbox": "http://localhost:4123/api/inbox"
      },
      "publicKey": {
        "id": "http://localhost:4123/api/users/hans#main-key",
        "owner": "http://localhost:4123/api/users/hans",
        "publicKeyPem": "adglkjlk89235kjn8obn2384f89z5bv9..."
      }
    }
    """

  Scenario: Try receiving a non existing actor object
    When I send a GET request to "/users/no-one"
    Then I expect the status code to be 404
