Feature: About me and and location
  As a user
  I would like to add some about me text and a location
  So others can get some info about me and my location

  The location and about me are displayed on the user profile. Later it will be possible
  to search for users by location.

  Background:
    Given I am logged in
    And I am on the "settings" page

  Scenario: I change my name
    When save "Hansi" as my new name
    Then I can see my new name "Hansi" when I click on my profile picture in the top right

    When I refresh the page
    Then I can see my new name "Hansi" when I click on my profile picture in the top right

  Scenario Outline: I set my location to "<location>"
    When I enter "<location>" as my location
    And I press "Save"
    And I visit the "profile/peter-lustig" page
    Then I can see a "<location>" as my location

    Examples: Location
        | location               | type    |
        | Paris                  | City    |
        | Mecklenburg-Vorpommern | Region  |
        | Germany                | Country |

  Scenario: I write about me
    When I enter "Some text about me" to about me
    And I press "Save"
    And I visit the "profile/peter-lustig" page
    Then I can see a "Some text about me" as my about me



