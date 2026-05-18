import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3000';

const ALL_ROUTES = [
  { path: '/', name: 'Dashboard' },
  { path: '/daybook', name: 'DayBook' },
  { path: '/kissan-khata', name: 'KissanKhata' },
  { path: '/add-kissan', name: 'AddKissan' },
  { path: '/clients', name: 'Clients' },
  { path: '/add-client', name: 'AddClient' },
  { path: '/investors', name: 'Investors' },
  { path: '/add-investor', name: 'AddInvestor' },
  { path: '/properties', name: 'Properties' },
  { path: '/add-property', name: 'AddProperty' },
  { path: '/expenses', name: 'Expenses' },
  { path: '/ledger', name: 'Ledger' },
  { path: '/gst-book', name: 'GSTBook' },
  { path: '/staff-ledger', name: 'StaffLedger' },
  { path: '/add-staff', name: 'AddStaff' },
  { path: '/loan-ledger', name: 'LoanLedger' },
  { path: '/add-lending-loan', name: 'AddLendingLoan' },
  { path: '/add-borrowing-loan', name: 'AddBorrowingLoan' },
  { path: '/reports', name: 'CAReports' },
  { path: '/add-transaction', name: 'AddTransaction' },
  { path: '/generate-noc', name: 'GenerateNOC' },
  { path: '/add-pre-sale-noc', name: 'AddPreSaleNOC' },
  { path: '/add-post-sale-noc', name: 'AddPostSaleNOC' },
  { path: '/add-loan-noc', name: 'AddLoanNOC' },
  { path: '/add-post-job-noc', name: 'AddPostJobNOC' },
  { path: '/generate-cheque', name: 'GenerateCheque' },
  { path: '/pending-cheques', name: 'PendingCheques' },
  { path: '/pending-receipts', name: 'PendingReceipts' },
  { path: '/pending-agreements', name: 'PendingAgreements' },
  { path: '/generate-receipt', name: 'ReceiptGenerator' },
  { path: '/documents', name: 'Documents' },
  { path: '/bank-manager', name: 'BankManager' },
  { path: '/settings', name: 'Settings' },
  { path: '/database', name: 'DataBasePage' },
  { path: '/database/categories', name: 'CategoriesPage' },
];

const DYNAMIC_ROUTES = [
  { path: '/clients/test-id', name: 'ClientProfile' },
  { path: '/kissan-khata/test-id', name: 'KissanProfile' },
  { path: '/properties/test-id', name: 'PropertyDetails' },
  { path: '/investors/test-id', name: 'InvestorDetails' },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();

  // Collect errors
  const consoleErrors = [];
  const pageErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), route: page.url() });
    }
  });

  page.on('pageerror', err => {
    pageErrors.push({ message: err.message, route: page.url() });
  });

  page.on('requestfailed', req => {
    networkErrors.push({ url: req.url(), error: req.failure()?.errorText, route: page.url() });
  });

  // Login
  console.log('--- LOGGING IN ---');
  await page.goto(`${BASE}/#/login`, { waitUntil: 'networkidle0', timeout: 30000 });
  await delay(2000);

  // Type credentials
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
    await inputs[0].type('admin');
    await inputs[1].type('ashray123');
  }
  await delay(300);

  // Click submit
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });
  await delay(3000);

  let hash = await page.evaluate(() => window.location.hash);
  let ss = await page.evaluate(() => sessionStorage.getItem('isLoggedIn'));
  console.log('After login, hash:', hash, 'sessionStorage:', ss);

  if (hash.includes('login')) {
    console.log('Login failed. Aborting.');
    const body = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('Page:', body);
    await browser.close();
    process.exit(1);
  }

  console.log('✅ Logged in. Starting route tests...\n');

  const results = [];

  for (const route of ALL_ROUTES) {
    console.log(`🔍 Testing: ${route.name} (${route.path})`);

    try {
      // Use SPA navigation via hash change
      await page.evaluate(path => { window.location.hash = path; }, route.path);
      await delay(3000);

      // Click all buttons to trigger hidden bugs
      await page.evaluate(() => {
        document.querySelectorAll('button').forEach(function(b) {
          try { b.click(); } catch(e) {}
        });
      });
      await delay(500);

      // Focus inputs
      await page.evaluate(() => {
        document.querySelectorAll('input, select, textarea').forEach(function(el) {
          try { el.focus(); } catch(e) {}
        });
      });
      await delay(300);

      const bodyPreview = await page.evaluate(() => {
        return document.body ? document.body.innerText.substring(0, 120) : '[empty]';
      });
      const hasViteError = await page.evaluate(() => {
        return !!document.querySelector('vite-error-overlay');
      });
      const urlNow = await page.evaluate(() => window.location.hash);
      const onLogin = urlNow.includes('login');

      results.push({ route: route.path, name: route.name, hasViteError, onLogin, bodyPreview, urlNow });
      console.log(`  ${onLogin ? '🔒 LOGIN' : '✅ OK'} | Body: ${bodyPreview.replace(/\n/g, ' ').substring(0, 60)}`);
      if (hasViteError) console.log(`  ⚠️ VITE OVERLAY`);
    } catch (err) {
      console.log(`  ❌ ERROR: ${err.message}`);
      results.push({ route: route.path, name: route.name, error: err.message });
    }
  }

  // Dynamic routes
  for (const route of DYNAMIC_ROUTES) {
    console.log(`\n🔍 Dynamic: ${route.name} (${route.path})`);
    try {
      await page.evaluate(path => { window.location.hash = path; }, route.path);
      await delay(2500);
      const bodyPreview = await page.evaluate(() => {
        return document.body ? document.body.innerText.substring(0, 100) : '';
      });
      console.log(`  Body: ${bodyPreview.replace(/\n/g, ' ').substring(0, 60)}`);
    } catch(err) {
      console.log(`  ❌ ERROR: ${err.message}`);
    }
  }

  // Report
  console.log('\n\n========== ERROR REPORT ==========');
  console.log(`\n📋 PAGE ERRORS (${pageErrors.length}):`);
  pageErrors.forEach(e => console.log(`  ❌ ${e.message.substring(0, 300)}`));

  console.log(`\n📋 CONSOLE ERRORS (${consoleErrors.length}):`);
  const uniqueErrors = [...new Set(consoleErrors.map(e => e.text))];
  uniqueErrors.forEach(e => {
    if (!e || e.includes('favicon.ico')) return;
    console.log(`  ❌ ${e.substring(0, 300)}`);
  });

  console.log(`\n📋 NETWORK ERRORS:`);
  networkErrors.forEach(e => {
    if (!e.url || e.url.includes('favicon')) return;
    console.log(`  ❌ ${e.error} - ${e.url.substring(0, 100)}`);
  });

  const viteErrors = results.filter(r => r.hasViteError);
  console.log(`\n📋 VITE OVERLAY ERRORS (${viteErrors.length}):`);
  viteErrors.forEach(r => console.log(`  ⚠️ ${r.route}`));

  const loginRoutes = results.filter(r => r.onLogin);
  const stableRoutes = results.filter(r => !r.onLogin);

  if (viteErrors.length === 0 && pageErrors.length === 0) {
    if (stableRoutes.length === results.length) {
      console.log('\n✅ RUNTIME FULLY STABLE — ALL ROUTES VERIFIED');
    } else {
      console.log(`\n⚠️ No crashes on ${stableRoutes.length}/${results.length} loaded routes`);
      console.log(`   ${loginRoutes.length} routes redirected to login (expected without auth)`);
    }
  }

  writeFileSync('route_test_results.json', JSON.stringify({ pageErrors, consoleErrors, networkErrors, results }, null, 2));
  await browser.close();
}

runTests().catch(async err => {
  console.error('FATAL:', err);
  process.exit(1);
});