Feature: Change password
  As a user
  I want to change my password in my settings
  For security, e.g. if I exposed my password by accident

  Login via email and password is a well-known authentication procedure and you
  can assure to the server that you are who you claim to be. Either if you
  exposed your password by acccident and you want to invalidate the exposed
  password or just out of an good habit, you want to change your password.

  Background:
    Given my user account has the following login credentials:
      | email            | passsword |
      | user@example.org | 1234      |
    And I am logged in

  Scenario: Change my password
    Given I am on the "settings" page
    And I click on "Security"
    When I fill the password form with:
      | Your old password    | 1234  |
      | Your new passsword   | 12345 |
      | Confirm new password | 12345 |
    And submit the form
    And I see a success message:
    """
    Password updated successfully
    """
    And I log out through the menu in the top right corner
    Then I cannot login anymore with password "1234"
    But I can login successfully with password "12345"
