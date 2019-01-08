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
    And I enter "Hansi" as my name
    And I press "Save"
    And I can click on my profile picture in the top right corner
    Then I can see a "Hansi" as my name

    When I refresh the page
    And I can click on my profile picture in the top right corner
    Then I can see a "Hansi" as my name

    When I visit the "settings" page
    And I enter "Peter Lustig" as my name
    And I press "Save"

  Scenario Outline: I set my location to "<location>"
    When I enter "<location>" as my location
    And I press "Save"
    And I visit the "profile/peter-lustig" page
    Then I can see a "<location>" as my location

    Examples: Location
        | location               |
        | New York               |
        | Germany                |
        | Berlin                 |
        | Mecklenburg-Vorpommern |

  Scenario: I write about me
    When I enter "Some text about me" to about me
    And I press "Save"
    And I visit the "profile/peter-lustig" page
    Then I can see a "Some text about me" as my about me



