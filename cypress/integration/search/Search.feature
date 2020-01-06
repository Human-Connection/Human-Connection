Feature: Search
  As a user
  I would like to be able to search for specific words
  In order to find related content

  Background:
    Given I have a user account
    And we have the following posts in our database:
      | id | title                                         | content                                 |
      | p1 | 101 Essays that will change the way you think | 101 Essays, of course!                  |
      | p2 | No searched for content                       | will be found in this post, I guarantee |
    And we have the following user accounts:
      | slug            | name            | id               |
      | search-for-me   | Search for me   | user-for-search  |
      | not-to-be-found | Not to be found | just-an-id       | 

    Given I am logged in

  Scenario: Search for specific words
    When I search for "Essays"
    Then I should have one item in the select dropdown
    Then I should see the following posts in the select dropdown:
      | title                                         |
      | 101 Essays that will change the way you think |

  Scenario: Press enter starts search
    When I type "Es" and press Enter
    Then I should have one item in the select dropdown
    Then I should see the following posts in the select dropdown:
      | title                                         |
      | 101 Essays that will change the way you think |

  Scenario: Press escape clears search
    When I type "Ess" and press escape
    Then the search field should clear

  Scenario: Select entry goes to post
    When I search for "Essays"
    And I select a post entry
    Then I should be on the post's page

  Scenario: Select dropdown content
    When I search for "Essays"
    Then I should have one item in the select dropdown
    Then I should see posts with the searched-for term in the select dropdown
    And I should not see posts without the searched-for term in the select dropdown

  Scenario: Search for users
    Given I search for "Search"
    Then I should have one item in the select dropdown
    And I should see the following users in the select dropdown:
      | slug            |
      | search-for-me   |
    And I select a user entry
    Then I should be on the user's profile