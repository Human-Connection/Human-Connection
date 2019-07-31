Feature: List Social Media Accounts
  As a User
  I'd like to enter my social media
  So I can show them to other users to get in contact

  Background:
    Given I have a user account
    And I am logged in

  Scenario: Adding Social Media
    Given I am on the "settings" page
    And I click on the "Social media" link
    Then I should be on the "/settings/my-social-media" page
    When I add a social media link
    Then it gets saved successfully
    And the new social media link shows up on the page

  Scenario: Other users viewing my Social Media
    Given I have added a social media link
    When people visit my profile page
    Then they should be able to see my social media links

  Scenario: Deleting Social Media
    Given I am on the "settings" page
    And I click on the "Social media" link
    Then I should be on the "/settings/my-social-media" page
    Given I have added a social media link
    When I delete a social media link
    Then it gets deleted successfully

  Scenario: Editing Social Media
    Given I am on the "settings" page
    And I click on the "Social media" link
    Then I should be on the "/settings/my-social-media" page
    Given I have added a social media link
    When I start editing a social media link
    Then I can cancel editing
    When I start editing a social media link
    And I edit and save the link
    Then it gets saved successfully
    And the new url is displayed
    But the old url is not displayed
