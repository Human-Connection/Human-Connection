Feature: Search
  As a user
  I would like to be able to search for specific words
  In order to find related content

  Background:
    Given we have the following posts in our database:
      | Author        | Title                                         | Content                | Slug       |
      | Brianna Wiest | 101 Essays that will change the way you think | 101 Essays, of course! | 101-essays |

  Scenario: Search for specific words
    Given I am logged in as "user"
    And I search for a specific word
    Then I should posts with that word included 
