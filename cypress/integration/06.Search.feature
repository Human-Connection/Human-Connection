Feature: Search
  As a user
  I would like to be able to search for specific words
  In order to find related content

  Background:
    Given I have a user account
    And we have the following posts in our database:
      | Author        | id | title                                         | content                |
      | Brianna Wiest | p1 | 101 Essays that will change the way you think | 101 Essays, of course! |

  Scenario: Search for specific words
    Given I am logged in
    When I search for a specific word
    Then I should see posts with that word included
