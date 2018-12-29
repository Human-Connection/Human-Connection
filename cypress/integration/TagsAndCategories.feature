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
    Given we have a selection of tags and categories as well as posts
    And my user account has the role "administrator"
    Given I am logged in

  Scenario: See an overview of categories
    When I navigate to the administration dashboard
    And I click on "Categories"
    Then I can see a list of categories ordered by post count:
      | Icon | Name               | Post Count |
      |      | Just For Fun       | 5          |
      |      | Happyness & Values | 2          |
      |      | Health & Wellbeing | 1          |

  Scenario: See an overview of tags
    When I navigate to the administration dashboard
    And I click on "Tags"
    Then I can see a list of tags ordered by user and post count:
      | # | Name        | Nutzer | Beiträge |
      | 1 | Naturschutz | 2      | 2        |
      | 2 | Freiheit    | 2      | 2        |
      | 3 | Umwelt      | 1      | 1        |
      | 4 | Demokratie  | 1      | 1        |



