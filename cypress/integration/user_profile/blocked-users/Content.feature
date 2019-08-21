Feature: Block a User
  As a user
  I'd like to have a button to block another user
  To prevent him from seeing and interacting with my contributions and also to avoid seeing his/her posts

  Background:
    Given I have a user account
    And there is an annoying user called "Spammy Spammer"

  Scenario Outline: Blocked users cannot see each others posts
    Given "Spammy Spammer" wrote a post "Spam Spam Spam"
    And I wrote a post "I hate spammers"
    And I block the user "Spammy Spammer"
    When I log in with:
      | Email   | Password   |
      | <email> | <password> |
    Then I see only one post with the title "<expected_title>"
    Examples:
      | email                      | password | expected_title  |
      | peterpan@example.org       | 1234     | I hate spammers |
      | spammy-spammer@example.org | 1234     | Spam Spam Spam  |

