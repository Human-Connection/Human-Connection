Feature: Authentication
  As a database administrator
  I want users to sign in
  In order to attribute posts and other contributions to their authors

  Background:
    Given I have a user account

  Scenario: Log in
    When I visit the "/login" page
    And I fill in my email and password combination and click submit
    Then I can click on my profile picture in the top right corner
    And I can see my name "Peter Lustig" in the dropdown menu

  Scenario: Refresh and stay logged in
    Given I am logged in
    When I refresh the page
    Then I am still logged in

  Scenario: Log out
    Given I am logged in
    When I log out through the menu in the top right corner
    Then I see the login screen again
