Feature: Upload UserProfile Image
  As a user
  I would like to be able to add an avatar/profile pic to my profile
  So that I can personalize my profile


  Background:
    Given I have a user account

  Scenario: Change my UserProfile Image
    Given I am logged in
    And I visit my profile page
    Then I should be able to change my profile picture

  Scenario: Unable to change another user's avatar
    Given I am logged in with a "user" role
    And I visit another user's profile page
    Then I cannot upload a picture