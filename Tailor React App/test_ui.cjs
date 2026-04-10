const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        console.log('Navigating to Appointment page...');
        await page.goto('http://localhost:5174/appointment', { waitUntil: 'networkidle' });

        if (page.url().includes('login')) {
            console.log('Logging in...');
            await page.fill('input[type="email"]', 'testuser2@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle' });

            await page.goto('http://localhost:5174/appointment', { waitUntil: 'networkidle' });
        }

        console.log('Waiting for data to load...');
        await page.waitForTimeout(3000);

        // Let's take a screenshot for visual proof
        await page.screenshot({ path: 'appointment_test.png' });

        const html = await page.content();
        if (html.includes('Test Mannequin')) {
            console.log('✅ SUCCESS: "Test Mannequin" found on the measurements page.');
        } else {
            console.log('❌ FAILURE: "Test Mannequin" NOT found on the measurements page.');
        }

        await browser.close();
        console.log('Done.');
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
})();
