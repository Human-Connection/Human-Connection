Feature: About me and location
  As a user
  I would like to add some about me text and a location
  So others can get some info about me and my location

  The location and about me are displayed on the user profile. Later it will be possible
  to search for users by location.

  Background:
    Given I have a user account
    And I am logged in
    And I am on the "settings" page

  Scenario: Change username
    When I save "Hansi" as my new name
    Then I can see my new name "Hansi" when I click on my profile picture in the top right
    And when I refresh the page
    Then the name "Hansi" is still there

  Scenario Outline: I set my location to "<location>"
    When I save "<location>" as my location
    When people visit my profile page
    Then they can see the location in the info box below my avatar

    Examples: Location
        | location      | type    |
        | Paris         | City    |
        | Saxony-Anhalt | Region  |
        | Germany       | Country |

  Scenario: Display a description on profile page
    Given I have the following self-description:
    """
    Ich lebe fettlos, fleischlos, fischlos dahin, fühle mich aber ganz wohl dabei
    """
    When people visit my profile page
    Then they can see the text in the info box below my avatar
