# EP-Playwright


## Assignment Steps Covered:

* Write tests for the Wikipedia page using playwright.dev

* Add two pages to your watchlist

* Removes one of the articles from your watchlist

* Makes sure that the second article is still present in the watchlist

* Goes to the article in the watchlist and makes sure that the title matches

## A little bit about the code structure:

For this assignment, I've implemented all the steps within a single test case to keep the flow straightforward.

* The login happens once before the test suite starts using `beforeAll`.

* The test performs the add, remove, and verification steps sequentially.

* Cleanup steps are included at the very end of the test case to remove the added articles and ensure the watchlist is clean after the test runs.

Finding reliable selectors on a dynamic website like Wikipedia was an interesting part of the challenge! I used a mix of CSS selectors and Playwright's built-in `getByRole` locators for better accessibility and robustness.


## What this test does:

This script automates the following steps on Wikipedia using a single test case:

1. **Logs into** a Wikipedia account.

2. Navigates to **two specific articles** ("The Matrix" and "Keanu Reeves") and adds them to the watchlist.

3. Goes to the **"Edit watchlist" page** to see the full list.

4. **Removes one** of the articles ("The Matrix") from the watchlist using the checkbox and remove button on the "Edit watchlist" page.

5. Confirms that the **second article** ("Keanu Reeves") is still present in the watchlist (on the "Edit watchlist" page).

6. Clicks the link for the second article ("Keanu Reeves") directly from the "Edit watchlist" page to **navigate to its article page**.

7. Verifies that the **title of the article page** matches the expected title ("Keanu Reeves").

8. Includes a cleanup step at the very end of the test to remove the second article ("Keanu Reeves") from the watchlist to ensure a clean state after the test runs.


## Important
 Set the Environment variable for the credentials before running the test in the terminal.
   export WIKI_USERNAME="YourWikipediaUsername"
   export WIKI_PASSWORD="YourWikipediaPassword"

## Design Patterns and Test Data Management
 I've kept the test logic within a single file for simplicity. However, in larger or more complex projects, I would implement design patterns like the Page Object Model (POM) to improve test maintainability, readability, and reusability by separating page interactions from test logic.

I am also aware of the importance of separating test data (like credentials or article titles) from the test code itself for better flexibility and maintainability. In larger projects, I would manage this data using configuration files or dedicated data management approaches.

I am comfortable implementing these patterns and practices in future projects to build more robust and scalable test automation frameworks.