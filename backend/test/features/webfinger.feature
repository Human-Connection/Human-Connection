Feature: Webfinger discovery
  From an external server, e.g. Mastodon
  I want to search for an actor alias
  In order to follow the actor

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug           |
      | peter-lustiger |

  Scenario: Search
    When I send a GET request to "/.well-known/webfinger?resource=acct:peter-lustiger@localhost"
    Then I receive the following json:
    """
    {
      "subject": "acct:peter-lustiger@localhost:4123",
      "links": [
        {
          "rel": "self",
          "type": "application/activity+json",
          "href": "http://localhost:4123/users/peter-lustiger"
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
    When I send a GET request to "/users/peter-lustiger"
    Then I receive the following json:
    """
    {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1"
        ],
        "id": "http://localhost:4123/users/peter-lustiger",
        "type": "Person",
        "preferredUsername": "peter-lustiger",
        "name": "peter-lustiger",
        "following": "http://localhost:4123/users/peter-lustiger/following",
        "followers": "http://localhost:4123/users/peter-lustiger/followers",
        "inbox": "http://localhost:4123/users/peter-lustiger/inbox",
        "outbox": "http://localhost:4123/users/peter-lustiger/outbox",
        "url": "http://localhost:4123/@peter-lustiger",
        "endpoints": {
            "sharedInbox": "http://localhost:4123/inbox"
        },
        "publicKey": {
            "id": "http://localhost:4123/users/peter-lustiger#main-key",
            "owner": "http://localhost:4123/users/peter-lustiger",
            "publicKeyPem": "adglkjlk89235kjn8obn2384f89z5bv9..."
        }
    }
    """
