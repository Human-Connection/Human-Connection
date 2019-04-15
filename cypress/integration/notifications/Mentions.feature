Feature: Notifications for a mentions
  As a user
  I want to be notified if sb. mentions me in a post or comment
  In order join conversations about or related to me

  Background:
    Given we have the following user accounts:
      | name              | slug              | email                 | password |
      | Wolle aus Hamburg | wolle-aus-hamburg | wolle@example.org     | 1234     |
    And we have the following posts in our database:
      | id | title     | content                                |
      | p1 | Hey Wolle | Hey @wolle-aus-hamburg, how do you do? |

  Scenario:
    When I log in with the following credentials:
      | email             | password |
      | wolle@example.org | 1234     |
    And see 1 unread notifications in the top menu
    And open the notification menu and click on the first item
    Then I get to the post page of ".../hey-wolle"
