Feature: Webfinger discovery
  From an external server, e.g. Mastodon
  I want to search for an actor alias
  In order to follow the actor

  Background:
    Given our own server runs at "http://localhost:4100"
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
          "href": "https://localhost:4123/activitypub/users/peter-lustiger"
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
    When I send a GET request to "/activitypub/users/peter-lustiger"
    Then I receive the following json:
    """
    {
        "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1"
        ],
        "id": "https://localhost:4123/activitypub/users/peter-lustiger",
        "type": "Person",
        "preferredUsername": "peter-lustiger",
        "name": "peter-lustiger",
        "following": "https://localhost:4123/activitypub/users/peter-lustiger/following",
        "followers": "https://localhost:4123/activitypub/users/peter-lustiger/followers",
        "inbox": "https://localhost:4123/activitypub/users/peter-lustiger/inbox",
        "outbox": "https://localhost:4123/activitypub/users/peter-lustiger/outbox",
        "url": "https://localhost:4123/activitypub/@peter-lustiger",
        "endpoints": {
            "sharedInbox": "https://localhost:4123/activitypub/inbox"
        },
        "publicKey": {
            "id": "https://localhost:4123/activitypub/users/peter-lustiger#main-key",
            "owner": "https://localhost:4123/activitypub/users/peter-lustiger",
            "publicKeyPem": "adglkjlk89235kjn8obn2384f89z5bv9..."
        }
    }
    """
