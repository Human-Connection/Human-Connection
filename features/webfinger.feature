Feature: Webfinger discovery
  From an external server, e.g. Mastodon
  I want to search for an actor alias
  In order to follow the actor

  Background:
    Given our CLIENT_URI is "http://localhost:3000"
    And we have the following users in our database:
      | name           | slug           |
      | Peter Lustiger | peter-lustiger |

  Scenario: Search a user
    When I send a GET request to "/.well-known/webfinger?resource=acct:peter-lustiger@localhost"
    Then the server responds with a HTTP Status 200 and the following json:
    """
    {
      "subject": "acct:peter-lustiger@localhost:3000",
      "links": [
        {
          "rel": "self",
          "type": "application/activity+json",
          "href": "http://localhost:3000/activitypub/users/peter-lustiger"
        }
      ]
    }
    """
    And the Content-Type is "application/jrd+json; charset=utf-8"

  Scenario: Search without result
    When I send a GET request to "/.well-known/webfinger?resource=acct:nonexisting@localhost"
    Then the server responds with a HTTP Status 404 and the following json:
    """
    {
      "error": "No record found for \"nonexisting@localhost\"."
    }
    """
