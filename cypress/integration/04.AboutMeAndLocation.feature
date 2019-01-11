Feature: About me and and location
  As a user
  I would like to add some about me text and a location
  So others can get some info about me and my location

  The location and about me are displayed on the user profile. Later it will be possible
  to search for users by location.

  Background:
    Given I am logged in
    And I am on the "settings" page

  Scenario: Change username
    When I save "Hansi" as my new name
    Then I can see my new name "Hansi" when I click on my profile picture in the top right

  Scenario: Keep changes after refresh
    When I changed my username to "Hansi" previously
    And I refresh the page
    Then my new username is still there

  Scenario Outline: I set my location to "<location>"
    When I save "<location>" as my location
    And my username is "Peter Lustig"
    When people visit my profile page
    Then they can see the location in the info box below my avatar

    Examples: Location
        | location               | type    |
        | Paris                  | City    |
        | Mecklenburg-Vorpommern | Region  |
        | Germany                | Country |

  Scenario: Display a description on profile page
    Given I have the following self-description:
    """
    Ich lebe fettlos, fleischlos, fischlos dahin, fühle mich aber ganz wohl dabei
    """
    And my username is "Peter Lustig"
    When people visit my profile page
    Then they can see the text in the info box below my avatar




