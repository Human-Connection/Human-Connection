Feature: Delete Teaser Image
  As a user
  I would like to be able to remove an image I have previously added to my Post
  So that I have control over the content of my Post

  Background:
    Given I have a user account
    Given I am logged in
    Given we have the following posts in our database:
      | authorId         | id | title              | content              |
      | id-of-peter-pan  | p1 | Post to be updated | successfully updated |

  Scenario: Delete existing image
    Given I am on the 'post/edit/p1' page
    And my post has a teaser image
    Then I should be able to remove the image
    And I click on "Save"
    Then I get redirected to ".../post-to-be-updated"
    And the "updated" post was saved successfully without a teaser image
