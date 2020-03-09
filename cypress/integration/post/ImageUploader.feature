Feature: Upload Teaser Image
  As a user
  I would like to be able to add a teaser image to my Post
  So that I can personalize my posts


  Background:
    Given I have a user account
    Given I am logged in
    Given we have the following posts in our database:
      | authorId         | id | title              | content              | 
      | id-of-peter-pan  | p1 | Post to be updated | successfully updated |

  Scenario: Create a Post with a Teaser Image
    When I click on the big plus icon in the bottom right corner to create post
    Then I should be able to "add" a teaser image
    And confirm crop
    And I add all required fields
    And I click on "Save"
    Then I get redirected to ".../new-post"
    And the post was saved successfully with the "new" teaser image

  Scenario: Update a Post to add an image
    Given I am on the 'post/edit/p1' page
    And I should be able to "change" a teaser image
    And confirm crop
    And I click on "Save"
    Then I see a toaster with "Saved!"
    And I get redirected to ".../post-to-be-updated"
    Then the post was saved successfully with the "updated" teaser image
  
  Scenario: Add image, then add a different image
    When I click on the big plus icon in the bottom right corner to create post
    Then I should be able to "add" a teaser image
    And confirm crop
    And I should be able to "change" a teaser image
    And confirm crop
    And the first image should not be displayed anymore

  Scenario: Add image, then delete it
    When I click on the big plus icon in the bottom right corner to create post
    Then I should be able to "add" a teaser image
    And I should be able to remove it
    And I add all required fields
    And I click on "Save"
    Then I get redirected to ".../new-post"
    And the "new" post was saved successfully without a teaser image
