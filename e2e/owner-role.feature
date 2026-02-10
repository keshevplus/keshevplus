Feature: Owner Role with Admin-Equivalent Permissions

  As a clinic owner,
  I want to have full admin access to the system
  So that I can manage all aspects of the clinic website.

  Background:
    Given the database has been seeded with an owner user
      | email              | role  | mustChangePassword |
      | dr@keshevplus.co.il | owner | true               |

  Scenario: Owner logs in and is prompted to change password on first login
    When I navigate to the admin login page
    And I enter "dr@keshevplus.co.il" as the email
    And I enter "12345678" as the password
    And I click the login button
    Then I should see the "Change Your Password" prompt
    And I should not see the admin dashboard

  Scenario: Owner changes password successfully
    Given I am logged in as the owner with the initial password
    And I see the "Change Your Password" prompt
    When I enter "12345678" as the current password
    And I enter "NewSecureP@ss1" as the new password
    And I enter "NewSecureP@ss1" as the confirm password
    And I click the "Change Password" button
    Then the password should be updated
    And I should be redirected to the admin dashboard
    And the mustChangePassword flag should be cleared

  Scenario: Owner has full admin functionality after password change
    Given I am logged in as the owner with the updated password
    Then I should see the admin dashboard
    And I should have access to the following admin sections:
      | section              |
      | Contacts             |
      | Appointments         |
      | Questionnaires       |
      | Clients / CRM        |
      | Translations         |
      | Chat Conversations   |
      | Site Settings        |
      | Visual Editor        |

  Scenario: Owner can manage contacts
    Given I am logged in as the owner with the updated password
    When I navigate to the Contacts section
    Then I should see the list of contact submissions
    And I should be able to mark contacts as read

  Scenario: Owner can manage appointments
    Given I am logged in as the owner with the updated password
    When I navigate to the Appointments section
    Then I should see the list of appointments
    And I should be able to update appointment statuses

  Scenario: Owner can manage clients and CRM activities
    Given I am logged in as the owner with the updated password
    When I navigate to the Clients section
    Then I should see the list of leads and clients
    And I should be able to convert a lead to a client
    And I should be able to add activity notes

  Scenario: Owner can edit translations
    Given I am logged in as the owner with the updated password
    When I navigate to the Translations section
    Then I should see the translation editor
    And I should be able to edit and save translations

  Scenario: Owner can review chat conversations
    Given I am logged in as the owner with the updated password
    When I navigate to the Chat Conversations section
    Then I should see the list of visitor conversations
    And I should be able to mark conversations as reviewed

  Scenario: Owner permissions are equivalent to admin
    Given I am logged in as the owner
    And another user is logged in as admin
    Then both users should have access to the same API endpoints
    And both users should see the same admin interface
