import { test, expect, Page, Browser } from '@playwright/test'; // Import Browser type

// Define the test suite
test.describe('Wikipedia Watchlist Test', () => {

    // Defined article titles
    const articleTitle1 = 'The_Matrix'; // Original article title with underscores
    const articleTitle2 = 'Keanu_Reeves'; // Original article title with underscores
    const article1DisplayTitle = articleTitle1.replace(/_/g, ' '); // Title as displayed in watchlist (with spaces)
    const article2DisplayTitle = articleTitle2.replace(/_/g, ' '); // Title as displayed in watchlist (with spaces)

    //create instance of page
    let page: Page;


    //Setup
    test.beforeAll(async ({ browser }) => { 
        const username = "Nicktest123"; //  username 
        const password = "endpoint123"; //  password 

        const context = await browser.newContext();
        page = await context.newPage(); 

        console.log('Logging in');
        await page.goto('https://en.wikipedia.org/wiki/Special:UserLogin');

        // Fill in username and password fields
        await page.locator('#wpName1').fill(username);
        await page.locator('#wpPassword1').fill(password);

        console.log('Fill in Credentials');

        // Click the login button
        await page.locator('#wpLoginAttempt').click();

        // Verify login success using the Watchlist link ID
        const watchlistLinkAfterLogin = page.locator('#pt-watchlist-2');

        try {
             await expect(watchlistLinkAfterLogin).toBeVisible({ timeout: 10000 }); // Keep a timeout for login verification
             console.log('Login successful');

        } catch (error) {
             console.error('Login failed:', error);
             // Fail the suite if login fails
             test.fail();
        }
    });


    // Test Case: Add, Remove, and Verify Watchlist Operations
    test('TC1', async () => {
        console.log('Starting test');

        // Define selectors for watchlist items on EditWatchlist page 
        const article1EditWatchlistItemSelector = `li:has-text("${article1DisplayTitle}")`;
        const article2EditWatchlistItemSelector = `li:has-text("${article2DisplayTitle}")`;
      
        // Define editWatchlistUrl here so it's accessible in the test function
        const editWatchlistUrl = 'https://en.wikipedia.org/wiki/Special:EditWatchlist';


        // --- Step 2: Add two pages to your watchlist ---
        const articleUrl1 = `https://en.wikipedia.org/wiki/${articleTitle1}`;
        await page.goto(articleUrl1);
        console.log(`Navigated to: ${articleTitle1}`);

        // Find and click the 'Watch' star icon or link.
        const watchButtonSelector = '#ca-watch';
        const watchLink1 = page.locator(watchButtonSelector);

        // Check if the watch link is visible before clicking
        if (await watchLink1.isVisible()) { 
            await watchLink1.click();
            console.log(`Clicked 'Watch' for ${articleTitle1}`);
            // After clicking watch, the 'Unwatch' link should appear.
            await page.waitForSelector('#ca-unwatch', { state: 'visible' });
            console.log(`Confirmed 'Unwatch' link is visible for ${article1DisplayTitle}`);
        } else {
             console.log(`'Watch' link not visible for ${article1DisplayTitle}. Article might already be watched or selector changed.`);
             const unwatchLinkIfWatched = page.locator('#ca-unwatch');
             if (await unwatchLinkIfWatched.isVisible()) {
                 console.log(`'${article1DisplayTitle}' is already watched.`);
             } else {
                  console.log(`Neither 'Watch' nor 'Unwatch' link visible for ${article1DisplayTitle}.`);
                
             }
        }


        //Article 2

        const articleUrl2 = `https://en.wikipedia.org/wiki/${articleTitle2}`;
        await page.goto(articleUrl2);
        console.log(`Navigated to: ${articleTitle2}`);
        const watchLink2 = page.locator(watchButtonSelector); 
         if (await watchLink2.isVisible()) { 
            await watchLink2.click();
            console.log(`Clicked 'Watch' for ${articleTitle2}`);
            await page.waitForSelector('#ca-unwatch', { state: 'visible' });
             console.log(`Confirmed 'Unwatch' link is visible for ${article2DisplayTitle}`);
        } else {
             console.log(`'Watch' link not visible for ${article2DisplayTitle}. Article might already be watched or selector changed.`);
              const unwatchLinkIfWatched = page.locator('#ca-unwatch');
             if (await unwatchLinkIfWatched.isVisible()) {
                 console.log(`'${article2DisplayTitle}' is already watched.`);
             } else {
                  console.log(`Neither 'Watch' nor 'Unwatch' link visible for ${article2DisplayTitle}.`);
             }
        }

        // --- Step 3: Navigate to the Edit Watchlist page ---
        await page.goto(editWatchlistUrl);
        console.log('Navigated to Edit Watchlist page.');

        // Verify both articles are present on the Edit Watchlist page after adding
        const pageBody = page.locator('body');
        await expect(pageBody).toContainText(article1DisplayTitle, { timeout: 30000 }); // Verify The Matrix is present
        await expect(pageBody).toContainText(article2DisplayTitle, { timeout: 30000 }); // Verify Keanu Reeves is present with a longer timeout
        console.log('Verified both articles are on Edit Watchlist page after adding.');


        // --- Step 4: Removes first article from  watchlist 
        console.log(`Attempting to remove ${article1DisplayTitle} from watchlist.`);

        // Find the checkbox associated with the article title on the Edit Watchlist page using getByRole
        // The accessible name includes the article title and "(talk | history)"
        const article1RemoveCheckbox = page.getByRole('checkbox', { name: `${article1DisplayTitle} (talk | history)` });

        console.log(`Checking for checkbox with accessible name: "${article1DisplayTitle} (talk | history)"`);

        // Check the checkbox to select the article for removal
        await expect(article1RemoveCheckbox).toBeVisible(); // Ensure the checkbox is visible
        await article1RemoveCheckbox.check(); // Click the checkbox
        console.log(`Checked checkbox for ${article1DisplayTitle} on EditWatchlist.`);

        // Find and click the "Remove titles" button
        // This button is typically near the bottom of the form.
        const removeTitlesButtonSelector = 'button:has-text("Remove titles")'; // Selector for the remove button

        const removeTitlesButton = page.locator(removeTitlesButtonSelector);
        await expect(removeTitlesButton).toBeVisible(); // Ensure the button is visible
        await removeTitlesButton.click();
        console.log('Clicked "Remove titles" button.');

        // After clicking remove, a confirmation message appears.
        const removalConfirmationMessage = page.locator('text=A single title was removed from your watchlist:');
        await expect(removalConfirmationMessage).toBeVisible({ timeout: 10000 }); // Wait for the confirmation message to appear
        console.log('Confirmed removal confirmation message is visible.');

        // Click the "Return to Special:Watchlist" link within the confirmation message
        const returnToWatchlistLink = page.getByRole('link', { name: 'Special:Watchlist' });
        await expect(returnToWatchlistLink).toBeVisible(); // Ensure the link is visible
        await returnToWatchlistLink.click();
        console.log('Clicked "Return to Special:Watchlist" link.');

        // Wait for the main Watchlist page to load after clicking the link
        await page.waitForURL('https://en.wikipedia.org/wiki/Special:Watchlist*');
        await page.waitForLoadState('networkidle');
        console.log('Navigated back to Special:Watchlist.');


        // verify the article is not on the main watchlist page.
        const pageBodyAfterNav = page.locator('body'); 
        await expect(pageBodyAfterNav).not.toContainText(article1DisplayTitle, { timeout: 10000 }); // Verify The Matrix is not on the main watchlist page
        console.log(`Verified ${article1DisplayTitle} is NOT present on main Watchlist page after removal.`);


        // --- Step 5: Makes sure that the second article is still in the watchlist ---
        await page.goto(editWatchlistUrl);
        console.log('Navigated back to Edit Watchlist page for Step 5 and 6.');

        console.log(`Checking if '${article2DisplayTitle}' is still present on EditWatchlist.`);
        // Verify second article is still there 
        await expect(pageBody).toContainText(article2DisplayTitle, { timeout: 10000 }); // Verify Keanu Reeves is still present
        console.log(`Verification successful: '${article2DisplayTitle}' is still present on EditWatchlist.`);

        // Optional: Verify the first article (The Matrix) is no longer present 
         await expect(pageBody).not.toContainText(article1DisplayTitle);
         console.log(`Verification successful: '${article1DisplayTitle}' is NOT present on EditWatchlist.`);


        // --- Step 6: Goes to the article in the watchlist (from EditWatchlist) ---
        console.log(`Attempting to navigate to ${article2DisplayTitle} from EditWatchlist.`);
        
        // Find the link for the second article (Keanu Reeves) on the EditWatchlist page
        const article2EditWatchlistLink = page.getByRole('link', { name: article2DisplayTitle }).first();


        if (await article2EditWatchlistLink.count() > 0) {
            await article2EditWatchlistLink.click(); // Click the link
            console.log(`Clicked link for ${articleTitle2} on EditWatchlist.`);
            await page.waitForLoadState('networkidle'); // Wait for the article page to load
        } else {
            console.log(`Link for ${article2DisplayTitle} not found on EditWatchlist.`);
            // Fail the test if the link is not found
            expect(true, `Link for ${article2DisplayTitle} should be found on the EditWatchlist`).toBe(false);
        }

        // Step 7: Verifies that the title of the second article matches the expected title ---
        console.log(`Matching page title '${article2DisplayTitle}'.`);
        const pageTitleElement = page.locator('#firstHeading');
        await expect(pageTitleElement).toHaveText(article2DisplayTitle);
        console.log(`Page title matches '${article2DisplayTitle}'.`);

        console.log('Completed test successfully.');

        // --- Cleanup watchlist after the test ---
        console.log(`Starting cleanup for ${article2DisplayTitle}...`);
        const editWatchlistUrlCleanup = 'https://en.wikipedia.org/wiki/Special:EditWatchlist'; // Use a different variable name for clarity

        try {
            // Navigate back to the Edit Watchlist page for cleanup
            await page.goto(editWatchlistUrlCleanup);
            console.log('Navigated to Edit Watchlist page for post-test cleanup.');

            // Attempt to remove Keanu Reeves if present
            const article2RemoveCheckbox = page.getByRole('checkbox', { name: `${article2DisplayTitle} (talk | history)` });
            const removeTitlesButton = page.locator('button:has-text("Remove titles")');

           if (await article2RemoveCheckbox.isVisible()) {
                console.log(`Found '${article2DisplayTitle}' on watchlist during post-test cleanup, attempting removal.`);
                await article2RemoveCheckbox.check();
                await expect(removeTitlesButton).toBeVisible();
                await removeTitlesButton.click();
                const removalConfirmationMessage = page.locator('text=A single title was removed from your watchlist:');
                await expect(removalConfirmationMessage).toBeVisible({ timeout: 5000 });
                console.log(`Removed '${article2DisplayTitle}'.`);
                await expect(removalConfirmationMessage).toBeHidden({ timeout: 5000 });
                await page.goto(editWatchlistUrlCleanup); // Navigate back to refresh the list
            } else {
                console.log(`'${article2DisplayTitle}' not found on watchlist during post-test cleanup, skipping removal.`);
            }

            // Final check that Keanu Reeves is gone
            const pageBodyCleanup = page.locator('body'); 
            await expect(pageBodyCleanup).not.toContainText(article2DisplayTitle, { timeout: 5000 });
            console.log('Confirmed Keanu Reeves is removed.');

        } catch (error) {
            console.error('Error after cleanup:', error);
        }

    });

    // Teardown
    test.afterAll(async () => {
        if (page) {
            await page.context().close();
            console.log('Browser closed.');
        }
    });
});
