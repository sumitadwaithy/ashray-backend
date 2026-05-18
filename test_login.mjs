import puppeteer from 'puppeteer';

const BASE = 'http://localhost:3000';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Mock settings
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('/api/settings')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          companyName: 'Ashray Group',
          companyLogo: '',
          adminPassword: 'test123',
        }),
      });
    } else {
      req.continue();
    }
  });

  // Step 1: Login via form
  console.log('=== Step 1: Login ===');
  await page.goto(`${BASE}/#/login`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Type credentials
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('admin');
    await inputs[1].type('ashray123');
  }
  
  // Click submit button
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 3000));

  let hash = await page.evaluate(() => window.location.hash);
  let ss = await page.evaluate(() => sessionStorage.getItem('isLoggedIn'));
  let ls = await page.evaluate(() => localStorage.getItem('isLoggedIn'));
  console.log('After login, hash:', hash, 'sessionStorage:', ss, 'localStorage:', ls);

  // If still on login, try the click differently
  if (hash.includes('login')) {
    console.log('Trying alternative click...');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 2000));
    hash = await page.evaluate(() => window.location.hash);
    ss = await page.evaluate(() => sessionStorage.getItem('isLoggedIn'));
    console.log('After form submit, hash:', hash, 'sessionStorage:', ss);
  }

  // If login succeeded, the page should reload (window.location.reload())
  // After reload, sessionStorage persists
  if (hash === '#/' || !hash.includes('login')) {
    console.log('✅ LOGIN SUCCESSFUL');
    const body = await page.evaluate(() => document.body?.innerText?.substring(0, 150));
    console.log('Dashboard:', body);
    
    // Now navigate to daybook
    console.log('\n=== Step 2: Navigate to DayBook ===');
    await page.goto(`${BASE}/#/daybook`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    hash = await page.evaluate(() => window.location.hash);
    ss = await page.evaluate(() => sessionStorage.getItem('isLoggedIn'));
    console.log('After nav to /daybook, hash:', hash, 'sessionStorage:', ss);
    
    const body2 = await page.evaluate(() => document.body?.innerText?.substring(0, 150));
    console.log('Body:', body2);
    
    if (hash.includes('login')) {
      console.log('❌ Redirected to login after nav - sessionStorage cleared?');
      // Check if the app is clearing it
    } else {
      console.log('✅ DayBook loaded successfully');
    }
  } else {
    console.log('❌ LOGIN FAILED');
    const body = await page.evaluate(() => document.body?.innerText?.substring(0, 300));
    console.log('Login page:', body);
  }

  await browser.close();
}

run().catch(console.error);