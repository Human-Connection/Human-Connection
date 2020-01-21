Feature: Mute a User
  As a user
  I'd like to have a button to mute another user
  To prevent him from seeing and interacting with my contributions
  Background:
    Given I have a user account
    And there is an annoying user called "Spammy Spammer"
    And I am logged in

  Scenario: Mute a user
    Given I am on the profile page of the annoying user
    When I click on "Mute user" from the content menu in the user info box
    And I navigate to my "Muted users" settings page
    Then I can see the following table:
      | Avatar | Name           |
      |        | Spammy Spammer |

  Scenario: Mute a previously followed user
    Given I follow the user "Spammy Spammer"
    And "Spammy Spammer" wrote a post "Spam Spam Spam"
    When I visit the profile page of the annoying user
    And I click on "Mute user" from the content menu in the user info box
    Then the list of posts of this user is empty
    And nobody is following the user profile anymore

  Scenario: Posts of muted users are filtered from search results
    Given we have the following posts in our database:
      | id                 | title                    | content                   |
      | im-not-muted | Post that should be seen | cause I'm not muted |
    Given "Spammy Spammer" wrote a post "Spam Spam Spam"
    When I search for "Spam"
    Then I should see the following posts in the select dropdown:
      | title          |
      | Spam Spam Spam |
    When I mute the user "Spammy Spammer"
    And I refresh the page
    And I search for "Spam"
    Then the search has no results
    But I search for "not muted"
    Then I should see the following posts in the select dropdown:
      | title                    |
      | Post that should be seen |

  Scenario: Muted users can still see my posts
    Given I previously created a post
    And I mute the user "Spammy Spammer"
    Given I log out
    And I am logged in as the "muted" user 
    When I search for "previously created"
    Then I should see the following posts in the select dropdown:
      | title                   |
      | previously created post |
