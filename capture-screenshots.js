const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const API_URL = "http://localhost:5000";
const EMAIL = "jaygurjar3045@gmail.com";
const PASS = "Jay4324";

const VIEWPORTS = [
  { name: 'laptop', width: 1440, height: 900, isMobile: false },
  { name: 'tablet', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true }
];

// Helper to make API calls to fetch token directly
function getAuthToken() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ Email: EMAIL, Password: PASS });
    const req = http.request(`${API_URL}/User/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.token);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log("Fetching auth token from backend...");
  const token = await getAuthToken();
  console.log("Token obtained successfully:", token ? token.substring(0, 20) + "..." : "none");

  // Create base screenshot folders
  const baseDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  for (const vp of VIEWPORTS) {
    const vpDir = path.join(baseDir, vp.name);
    if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir, { recursive: true });
    console.log(`\n========================================`);
    console.log(`Capturing for Viewport: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch
    });

    // 1. Register Page
    console.log(`[${vp.name}] Capturing 01_register.png...`);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(1500);
    await page.screenshot({ path: path.join(vpDir, '01_register.png'), fullPage: true });

    // 2. Login Page (Clean)
    console.log(`[${vp.name}] Capturing 02_login_clean.png...`);
    await page.goto(`${BASE_URL}/Login`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(1500);
    await page.screenshot({ path: path.join(vpDir, '02_login_clean.png'), fullPage: true });

    // 3. Login Operation: Fill inputs and capture filled state
    console.log(`[${vp.name}] Filling credentials...`);
    try {
      await page.type('#email', EMAIL, { delay: 50 });
      await page.type('#password', PASS, { delay: 50 });
      await delay(500);
      await page.screenshot({ path: path.join(vpDir, '03_login_filled.png'), fullPage: true });

      // Click sign in button
      console.log(`[${vp.name}] Submitting Login...`);
      const buttons = await page.$$('button');
      for (const btn of buttons) {
        const text = await (await btn.getProperty('innerText')).jsonValue();
        if (text && text.toLowerCase().includes('sign in')) {
          await btn.click();
          break;
        }
      }
      await delay(2500);
      await page.screenshot({ path: path.join(vpDir, '04_login_success.png'), fullPage: true });
    } catch (err) {
      console.warn(`Login form interaction warning:`, err.message);
    }

    // Set token in localStorage to ensure private routes load flawlessly
    await page.evaluate((tok) => {
      localStorage.setItem('token', tok);
    }, token);

    // 4. Dashboard
    console.log(`[${vp.name}] Capturing 05_dashboard.png...`);
    await page.goto(`${BASE_URL}/DashBoard`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2500);
    await page.screenshot({ path: path.join(vpDir, '05_dashboard.png'), fullPage: true });

    // 5. Income Panel
    console.log(`[${vp.name}] Capturing 06_income.png...`);
    await page.goto(`${BASE_URL}/Dashboard/Income`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2500);
    await page.screenshot({ path: path.join(vpDir, '06_income.png'), fullPage: true });

    // 6. Expense Panel
    console.log(`[${vp.name}] Capturing 07_expense.png...`);
    await page.goto(`${BASE_URL}/Dashboard/Expense`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2500);
    await page.screenshot({ path: path.join(vpDir, '07_expense.png'), fullPage: true });

    // 7. Overview Panel (Analytics & Charts)
    console.log(`[${vp.name}] Capturing 08_overview.png...`);
    await page.goto(`${BASE_URL}/Dashboard/Overview`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2500);
    await page.screenshot({ path: path.join(vpDir, '08_overview.png'), fullPage: true });

    // 8. Edit Profile Panel
    console.log(`[${vp.name}] Capturing 09_edit_profile.png...`);
    await page.goto(`${BASE_URL}/EditProfile`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2000);
    await page.screenshot({ path: path.join(vpDir, '09_edit_profile.png'), fullPage: true });

    // 9. Forgot Password Page
    console.log(`[${vp.name}] Capturing 10_forgot_password.png...`);
    await page.goto(`${BASE_URL}/forgetPassword`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(1500);
    await page.screenshot({ path: path.join(vpDir, '10_forgot_password.png'), fullPage: true });

    await page.close();
  }

  await browser.close();
  console.log("\nAll screenshots captured successfully across all resolutions!");
}

run().catch(err => {
  console.error("Fatal error during screenshot capture:", err);
  process.exit(1);
});
