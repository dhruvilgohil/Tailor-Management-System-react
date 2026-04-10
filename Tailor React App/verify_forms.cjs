const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting visual form verification...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // 1. Test Orders Form
        console.log('Testing Orders Screen...');
        await page.goto('http://localhost:5173/orders', { waitUntil: 'networkidle0' });

        // Wait for and click Add Order
        await page.waitForSelector('button', { text: 'Add Order' });
        const buttons = await page.$$('button');
        for (let btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes('Add Order')) {
                await btn.click();
                break;
            }
        }

        await page.waitForSelector('input[placeholder="Customer Name"]'); // Customer generic field

        // Check Payment Method toggle logic
        await page.select('select', 'Pending'); // Select Pending payment
        await page.waitForTimeout(500); // give React state time to render date picker

        const datePickers = await page.$$('input[type="date"]');
        if (datePickers.length >= 2) { // 1 for delivery, 1 for pending payment
            console.log('✅ Orders Form Payment Toggle logic works.');
        } else {
            console.log('❌ Orders Form Payment Toggle logic failed.');
        }

        // Close modal
        await page.keyboard.press('Escape'); // usually works, or we find the cancel button

        // 2. Test Measurement Form
        console.log('Testing Measurement Screen...');
        await page.goto('http://localhost:5173/appointment', { waitUntil: 'networkidle0' });

        // Find customer dropdown and select index 1 (Viraj)
        const selects = await page.$$('select');
        await page.select('select:first-of-type', '1');
        await page.waitForTimeout(500);

        // Check if Contact field is disabled and populated
        const disabledInput = await page.$('input[disabled]');
        const mobileVal = await page.evaluate(el => el.value, disabledInput);
        if (mobileVal && mobileVal.includes('+91')) {
            console.log('✅ Measurement Customer Auto-Fetch logic works.');
        } else {
            console.log('❌ Measurement Customer Auto-Fetch logic failed.');
        }

        console.log('All verification tasks ran successfully.');

    } catch (e) {
        console.error('Test script encountered an error:', e);
    } finally {
        await browser.close();
    }
})();
