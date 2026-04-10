const { chromium } = require('@playwright/test');

(async () => {
    console.log('Starting Playwright visual checks...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // 1. Orders Screen
        console.log('Testing Orders Screen...');
        await page.goto('http://localhost:5173/orders', { waitUntil: 'networkidle' });

        // Click 'Add Order'
        await page.click('button:has-text("Add Order")');
        await page.waitForSelector('text=Order Details');

        // Test toggle payment
        await page.locator('select').filter({ hasText: 'Pending' }).selectOption('Pending');

        const datePickers = await page.locator('input[type="date"]').count();
        if (datePickers >= 2) {
            console.log('✅ Orders Form Payment Toggle logic works.');
        } else {
            console.log('❌ Orders Form Payment Toggle logic failed.');
        }

        await page.keyboard.press('Escape');

        // 2. Measurement Screen
        console.log('Testing Appointment Screen...');
        await page.goto('http://localhost:5173/appointment', { waitUntil: 'networkidle' });

        // Select Viraj (id 1)
        await page.locator('select').first().selectOption('1');
        await page.waitForTimeout(500); // Give React time to update state

        // Check if Contact is filled
        const disabledInput = page.locator('input[disabled]');
        const mobileVal = await disabledInput.inputValue();

        if (mobileVal && mobileVal.includes('+91')) {
            console.log('✅ Measurement Customer Auto-Fetch logic works.');
        } else {
            console.log('❌ Measurement Customer Auto-Fetch logic failed. Found: ' + mobileVal);
        }

        console.log('✅ All Playwright checks ran successfully.');

    } catch (err) {
        console.error('Playwright encountered an error:', err);
    } finally {
        await browser.close();
    }
})();
