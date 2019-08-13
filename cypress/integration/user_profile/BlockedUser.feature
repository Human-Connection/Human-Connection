Feature: Block another user
  As a user
  I'd like to have a button to block another user
  To prevent him to see and interact with my contributions and also to avoid to see his/her posts

  Background:
    Given I have a user account
    And there is an annoying user called "Spammy Spammer"
    And I am logged in

  Scenario: Block a user
    Given I am on the profile page of the annoying user
    When I click on "Block User" from the content menu in the user info box
    And I navigate to my "Blocked users" settings page
    Then I can see the following table:
      | Avatar        | Name           |
      |               | Spammy Spammer |

  Scenario Outline: Blocked users cannot see each others posts
    Given "Spammy Spammer" wrote a post "Spam Spam Spam"
    And I wrote a post "I hate spammers"
    And I block the user "Spammy Spammer"
    When I log in with <account>
    Then I see only one post with the title <expected_title>
    Examples:
      | accout                  | expected_title  |
      | my own account          | I hate spammers |
      | spammy spammers account | Spam Spam Spam  |

  Scenario: Block a previously followed user
    Given I follow the user "Spammy Spammer"
    When I visit the profile page of the annoying user
    And I click on "Block User" from the content menu in the user info box
    Then the list of posts of this user is empty
    And nobody is following the user profile anymore

  Scenario: Posts of blocked users are filtered from search results
    Given "Spammy Spammer" wrote a post "Spam Spam Spam"
    When I search for "Spam"
    Then I should see the following posts in the select dropdown:
      | title          |
      | Spam Spam Spam |
    But if I block the user "Spammy Spammer"
    Then the search has no results
