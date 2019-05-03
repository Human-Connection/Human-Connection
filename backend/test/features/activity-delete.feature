Feature: Delete an object
  I want to delete objects

  Background:
    Given our own server runs at "http://localhost:4123"
    And we have the following users in our database:
      | Slug          |
      | spongebob     |
    And I send a POST request with the following activity to "/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://localhost:4123/api/users/spongebob/status/kljsddgnffgdgsx9bv8adg43jfdgkgnsdf234s",
      "type": "Create",
      "actor": "http://localhost:4123/users/spongebob",
      "object": {
        "id": "https://localhost:4123/api/users/spongebob/status/kljsddgnffgdgsx9bv8adg43jfdgkgnsdf234",
        "type": "Article",
        "published": "2019-02-07T19:37:55.002Z",
        "attributedTo": "https://localhost:4123/api/users/spongebob",
        "content": "Test content for deletion!",
        "to": "https://www.w3.org/ns/activitystreams#Public"
      }
    }
    """

  Scenario: Deleting a post (Article Object)
    When I send a POST request with the following activity to "/inbox":
    """
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://localhost:4123/api/users/spongebob/status/kljsddgnffgdgsx9bv8adg43jfdgkgnsdf234s",
      "type": "Delete",
      "actor": "http://localhost:4123/users/spongebob",
      "object": {
        "id": "https://localhost:4123/api/users/spongebob/status/kljsddgnffgdgsx9bv8adg43jfdgkgnsdf234",
        "type": "Article",
        "published": "2019-02-07T19:37:55.002Z",
        "attributedTo": "https://localhost:4123/api/users/spongebob",
        "content": "Test content for deletion!",
        "to": "https://www.w3.org/ns/activitystreams#Public"
      }
    }
    """
    Then I expect the status code to be 200
    And the post with id "kljsddgnffgdgsx9bv8adg43jfdgkgnsdf234" to be deleted
