import puppeteer from 'puppeteer';

const BASE = 'http://localhost:3000';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`  [${msg.type()}] ${msg.text().substring(0, 200)}`);
  });

  // Login
  await page.goto(`${BASE}/#/login`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('admin');
    await inputs[1].type('ashray123');
  }
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  console.log('After login:');
  console.log('  hash:', await page.evaluate(() => window.location.hash));
  console.log('  ss:', await page.evaluate(() => sessionStorage.getItem('isLoggedIn')));

  // Navigate via hash
  console.log('\nNavigating to daybook via hash...');
  await page.evaluate(() => { window.location.hash = '#/daybook'; });
  await new Promise(r => setTimeout(r, 3000));

  console.log('After hash change:');
  console.log('  hash:', await page.evaluate(() => window.location.hash));
  console.log('  ss:', await page.evaluate(() => sessionStorage.getItem('isLoggedIn')));
  const body = await page.evaluate(() => document.body?.innerText?.substring(0, 150));
  console.log('  body:', body?.substring(0, 100));

  await browser.close();
}

run().catch(console.error);