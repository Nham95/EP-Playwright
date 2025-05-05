import { test, expect, Page, Browser } from '@playwright/test'; // Import Browser type

// Define the test suite
test.describe('Wikipedia Watchlist Test', () => {

    // Defined article titles
    const articleTitle1 = 'The_Matrix'; // Original article title with underscores
    const articleTitle2 = 'Keanu_Reeves'; // Original article title with underscores
    const article1DisplayTitle = articleTitle1.replace(/_/g, ' '); // Title as displayed in watchlist (with spaces)
    const article2DisplayTitle = articleTitle2.replace(/_/g, ' '); // Title as displayed in watchlist (with spaces)

    let page: Page; // Create instance of page

    // Setup: Log in once before all tests
    test.beforeAll(async ({ browser }) => {
        // Read credentials from environment variables.
        // Set WIKI_USERNAME and WIKI_PASSWORD before running the test.
        const username = process.env.WIKI_USERNAME;
        const password = process.env.WIKI_PASSWORD;

        if (!username || !password) {
            console.error('Error: WIKI_USERNAME and WIKI_PASSWORD environment variables must be set.');
            test.fail();
        }

        const context = await browser.newContext();
        page = await context.newPage();

        await page.goto('https://en.wikipedia.org/wiki/Special:UserLogin');

        // Fill in username and password fields
        await page.locator('#wpName1').fill(username);
        await page.locator('#wpPassword1').fill(password);

        // Click the login button
        await page.locator('#wpLoginAttempt').click();

        // Verify login success by checking for an element that appears only after authentication
        const watchlistLinkAfterLogin = page.locator('#pt-watchlist-2');

        try {
             await expect(watchlistLinkAfterLogin).toBeVisible({ timeout: 10000 });
             console.log('Login successful');
        } catch (error) {
             console.error('Login failed:', error);
             test.fail();
        }
    });

    // Teardown: Close the page and context after the suite
    test.afterAll(async () => {
        if (page) {
            await page.context().close();
            console.log('Browser closed.');
        }
    });

    // Test Case: Add, Remove, and Verify Watchlist Operations
    test('TC1', async () => {
        console.log('Starting test');

        // Define editWatchlistUrl here so it's accessible in the test function
        const editWatchlistUrl = 'https://en.wikipedia.org/wiki/Special:EditWatchlist';

        // --- Step 2: Add two pages to your watchlist ---
        const articleUrl1 = `https://en.wikipedia.org/wiki/${articleTitle1}`;
        await page.goto(articleUrl1);
        console.log(`Navigated to: ${articleTitle1}`);

        // Find and click the 'Watch' star icon or link.
        const watchButtonSelector = '#ca-watch';
        const watchLink1 = page.locator(watchButtonSelector);

        if (await watchLink1.isVisible()) {
            await watchLink1.click();
            await page.waitForSelector('#ca-unwatch', { state: 'visible' });
            console.log(`Clicked 'Watch' for ${articleTitle1}`);
        } else {
             const unwatchLinkIfWatched = page.locator('#ca-unwatch');
             if (await unwatchLinkIfWatched.isVisible()) {
                 console.log(`'${article1DisplayTitle}' is already watched.`);
             } else {
                  console.log(`Neither 'Watch' nor 'Unwatch' link visible for ${article1DisplayTitle}.`);
             }
        }

        const articleUrl2 = `https://en.wikipedia.org/wiki/${articleTitle2}`;
        await page.goto(articleUrl2);
        console.log(`Navigated to: ${articleTitle2}`);
        const watchLink2 = page.locator(watchButtonSelector);
         if (await watchLink2.isVisible()) {
            await watchLink2.click();
            await page.waitForSelector('#ca-unwatch', { state: 'visible' });
             console.log(`Clicked 'Watch' for ${articleTitle2}`);
        } else {
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
        await expect(pageBody).toContainText(article1DisplayTitle, { timeout: 30000 });
        await expect(pageBody).toContainText(article2DisplayTitle, { timeout: 30000 });
        console.log('Verified both articles are on Edit Watchlist page after adding.');


        // --- Step 4: Removes first article from watchlist
        console.log(`Attempting to remove ${article1DisplayTitle} from watchlist.`);

        // Find the checkbox associated with the article title on the Edit Watchlist page
        const article1RemoveCheckbox = page.getByRole('checkbox', { name: `${article1DisplayTitle} (talk | history)` });

        await expect(article1RemoveCheckbox).toBeVisible();
        await article1RemoveCheckbox.check();

        // Find and click the "Remove titles" button
        const removeTitlesButton = page.locator('button:has-text("Remove titles")');
        await expect(removeTitlesButton).toBeVisible();
        await removeTitlesButton.click();
        console.log('Clicked "Remove titles" button.');

        // Handle Removal Confirmation and navigate back to main Watchlist page
        const removalConfirmationMessage = page.locator('text=A single title was removed from your watchlist:');
        await expect(removalConfirmationMessage).toBeVisible({ timeout: 10000 });

        const returnToWatchlistLink = page.getByRole('link', { name: 'Special:Watchlist' });
        await expect(returnToWatchlistLink).toBeVisible();
        await returnToWatchlistLink.click();

        await page.waitForURL('https://en.wikipedia.org/wiki/Special:Watchlist*');
        await page.waitForLoadState('networkidle');
        console.log('Navigated back to Special:Watchlist.');

        // Verify the article is not on the main watchlist page.
        const pageBodyAfterNav = page.locator('body');
        await expect(pageBodyAfterNav).not.toContainText(article1DisplayTitle, { timeout: 10000 });
        console.log(`Verified ${article1DisplayTitle} is NOT present on main Watchlist page after removal.`);


        // --- Step 5: Makes sure that the second article is still present in the watchlist ---
        await page.goto(editWatchlistUrl);
        console.log('Navigated back to Edit Watchlist page for Step 5 and 6.');

        console.log(`Checking if '${article2DisplayTitle}' is still present on EditWatchlist.`);
        await expect(pageBody).toContainText(article2DisplayTitle, { timeout: 10000 });
        console.log(`Verification successful: '${article2DisplayTitle}' is still present on EditWatchlist.`);

        // Optional: Verify the first article (The Matrix) is no longer present
         await expect(pageBody).not.toContainText(article1DisplayTitle);
         console.log(`Verification successful: '${article1DisplayTitle}' is NOT present on EditWatchlist.`);


        // --- Step 6: Goes to the article in the watchlist (from EditWatchlist) ---
        console.log(`Attempting to navigate to ${article2DisplayTitle} from EditWatchlist.`);

        // Find the link for the second article (Keanu Reeves) on the EditWatchlist page
        const article2EditWatchlistLink = page.getByRole('link', { name: article2DisplayTitle }).first();


        if (await article2EditWatchlistLink.count() > 0) {
            await article2EditWatchlistLink.click();
            console.log(`Clicked link for ${articleTitle2} on EditWatchlist.`);
            await page.waitForLoadState('networkidle');
        } else {
            console.log(`Link for ${article2DisplayTitle} not found on EditWatchlist.`);
            test.fail();
        }

        // Step 7: Verifies that the title of the second article matches the expected title ---
        console.log(`Matching page title '${article2DisplayTitle}'.`);
        const pageTitleElement = page.locator('#firstHeading');
        await expect(pageTitleElement).toHaveText(article2DisplayTitle);
        console.log(`Page title matches '${article2DisplayTitle}'.`);

        console.log('Completed test successfully.');

        // --- Cleanup watchlist after the test ---
        console.log(`Starting cleanup for ${article2DisplayTitle}...`);
        const editWatchlistUrlCleanup = 'https://en.wikipedia.org/wiki/Special:EditWatchlist';

        try {
            await page.goto(editWatchlistUrlCleanup);
            console.log('Navigated to Edit Watchlist page for post-test cleanup.');

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
                await page.goto(editWatchlistUrlCleanup);
            } else {
                console.log(`'${article2DisplayTitle}' not found on watchlist during post-test cleanup, skipping removal.`);
            }

            const pageBodyCleanup = page.locator('body');
            await expect(pageBodyCleanup).not.toContainText(article2DisplayTitle, { timeout: 5000 });
            console.log('Confirmed Keanu Reeves is removed.');

        } catch (error) {
            console.error('Error after cleanup:', error);
        }

    });
});

