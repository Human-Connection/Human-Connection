Feature: Block a User
  As a user
  I'd like to have a button to block another user
  To prevent him from seeing and interacting with my contributions and also to avoid seeing his/her posts

  Background:
    Given I have a user account
    And there is an annoying user called "Spammy Spammer"
    And I am logged in
    And we have a selection of categories

  Scenario: Block a user
    Given I am on the profile page of the annoying user
    When I click on "Block user" from the content menu in the user info box
    And I navigate to my "Blocked users" settings page
    Then I can see the following table:
      | Avatar | Name           |
      |        | Spammy Spammer |

  Scenario: Block a previously followed user
    Given I follow the user "Spammy Spammer"
    And "Spammy Spammer" wrote a post "Spam Spam Spam"
    When I visit the profile page of the annoying user
    And I click on "Block user" from the content menu in the user info box
    Then the list of posts of this user is empty
    And nobody is following the user profile anymore

  Scenario: Posts of blocked users are filtered from search results
    Given "Spammy Spammer" wrote a post "Spam Spam Spam"
    When I search for "Spam"
    Then I should see the following posts in the select dropdown:
      | title          |
      | Spam Spam Spam |
    When I block the user "Spammy Spammer"
    And I refresh the page
    And I search for "Spam"
    Then the search has no results
