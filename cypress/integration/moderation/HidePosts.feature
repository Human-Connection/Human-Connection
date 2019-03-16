Feature: Hide Posts
  As the moderator team
  we'd like to be able to hide posts from the public
  to enforce our network's code of conduct and/or legal regulations

  Background:
    Given we have the following posts in our database:
      | id | title                       | deleted | disabled |
      | p1 | This post should be visible |         |          |
      | p2 | This post is disabled       |         |    x     |
      | p3 | This post is deleted        |    x    |          |

  Scenario: Disabled posts don't show up on the landing page
    Given I am logged in with a "user" role
    Then I should see only 1 post on the landing page
    And the first post on the landing page has the title:
    """
    This post should be visible
    """

  Scenario: Visiting a disabled post's page should return 404
    Given I am logged in with a "user" role
    Then the page "/post/this-post-is-disabled" returns a 404 error with a message:
    """
    This post could not be found
    """
