Feature: Search
  As a user
  I would like to be able to search for specific words
  In order to find related content

  Background:
    Given I have a user account
    And we have the following posts in our database:
      | Author        | id | title                                         | content                                 |
      | Brianna Wiest | p1 | 101 Essays that will change the way you think | 101 Essays, of course!                  |
      | Brianna Wiest | p1 | No searched for content                       | will be found in this post, I guarantee |

  Scenario: Search for specific words
    Given I am logged in
    When I search for "Essays"
    Then I should see posts with that word included

  Scenario: Press enter starts search
    Given I am logged in
    When I type "Ess" and press Enter
    Then I should see posts with that word included

  Scenario: Press escape clears search
    Given I am logged in
    When I type "Ess" and press escape
    Then the search field should clear

  Scenario: Select entry goes to post
    When I search for "Essays"
    And I select an entry
    Then I should be on the post's page

  Scenario: Select dropdown content
    When I search for "Essays"
    Then I should see posts with the searched-for term in the select dropdown
    And I should not see posts without the searched-for term in the select dropdown
