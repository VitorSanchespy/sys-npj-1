// Debug script to test what the frontend receives
const puppeteer = require('puppeteer');

async function debugFrontend() {
    const browser = await puppeteer.launch({ 
        headless: false,
        devtools: true 
    });
    
    try {
        const page = await browser.newPage();
        
        // Listen to all network requests
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('processos') && url.includes('detalhes')) {
                console.log(`📡 Request to: ${url}`);
                console.log(`📊 Status: ${response.status()}`);
                
                try {
                    const responseText = await response.text();
                    console.log(`📋 Response: ${responseText.substring(0, 200)}...`);
                } catch (e) {
                    console.log('❌ Could not read response');
                }
            }
        });
        
        // Listen to console logs from the page
        page.on('console', msg => {
            console.log(`🔍 CONSOLE: ${msg.text()}`);
        });
        
        console.log('🌐 Navigating to login page...');
        await page.goto('http://localhost:5173');
        
        // Login
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.type('input[type="email"]', 'admin@teste.com');
        await page.type('input[type="password"]', 'admin123');
        
        console.log('🔐 Logging in...');
        await page.click('button[type="submit"]');
        
        // Wait for navigation after login
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        console.log('📄 Navigating to process details...');
        await page.goto('http://localhost:5173/processos/1');
        
        // Wait a bit for the page to load
        await page.waitForTimeout(5000);
        
        // Check what's actually in the DOM
        const titleElement = await page.$('h1');
        if (titleElement) {
            const titleText = await page.evaluate(el => el.textContent, titleElement);
            console.log(`📝 Title found: "${titleText}"`);
        } else {
            console.log('❌ No h1 title element found');
        }
        
        // Check if there are any error messages
        const errorElements = await page.$$('[class*="error"], [class*="Error"]');
        if (errorElements.length > 0) {
            console.log(`🚨 Found ${errorElements.length} error elements`);
        }
        
        console.log('✅ Debug complete - check console output above');
        
    } catch (error) {
        console.error('❌ Error during debugging:', error);
    } finally {
        await browser.close();
    }
}

debugFrontend();
