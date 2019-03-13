Feature: Change password
  As a user
  I want to change my password in my settings
  Because this is a basic security feature, e.g. if I exposed my password by accident

  Background: 
    Given I have a user account
    And I am logged in
    And I am on the "settings" page
  
  Scenario: Change my password
    Given I click on the "Security" link
    Then I should be on the "Security" settings page
    And I should be able to change my password