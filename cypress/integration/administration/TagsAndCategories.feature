Feature: Tags and Categories
  As a database administrator
  I would like to see a summary of all tags and categories and their usage
  In order to be able to decide which tags and categories are popular or not

  The currently deployed application, codename "Alpha", distinguishes between
  categories and tags. Each post can have a number of categories and/or tags.
  A few categories are required for each post, tags are completely optional.
  Both help to find relevant posts in the database, e.g. users can filter for
  categories.

  If administrators summary of all tags and categories and how often they are
  used, they learn what new category might be convenient for users, e.g. by
  looking at the popularity of a tag.

  Background:
    Given my user account has the role "admin"
    And we have a selection of tags and categories as well as posts
    And I am logged in

  Scenario: See an overview of categories
    When I navigate to the administration dashboard
    And I click on the menu item "Categories"
    Then I can see the following table:
      |      | Name               | Posts      |
      |      | Just For Fun       | 2          |
      |      | Happyness & Values | 1          |
      |      | Health & Wellbeing | 0          |

  Scenario: See an overview of tags
    When I navigate to the administration dashboard
    And I click on the menu item "Tags"
    Then I can see the following table:
      |   | Name      | Users  | Posts    |
      | 1 | Democracy | 2      | 3        |
      | 2 | Ecology   | 1      | 1        |
      | 3 | Nature    | 1      | 2        |
