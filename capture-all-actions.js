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

async function safeClickButton(page, text) {
  return await page.evaluate((btnText) => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const btn = buttons.find(b => b.innerText && b.innerText.trim().toLowerCase().includes(btnText.toLowerCase()));
    if (btn) {
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      btn.click();
      return true;
    }
    return false;
  }, text);
}

async function run() {
  console.log("Obtaining auth token from API...");
  const token = await getAuthToken();
  console.log("Token successfully acquired!");

  const baseDir = path.join(__dirname, 'screenshots', 'all_actions');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  for (const vp of VIEWPORTS) {
    const vpDir = path.join(baseDir, vp.name);
    if (!fs.existsSync(vpDir)) fs.mkdirSync(vpDir, { recursive: true });

    console.log(`\n======================================================`);
    console.log(`STARTING ALL-ACTION CAPTURE FOR: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    const page = await browser.newPage();
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch
    });

    // ---------------------------------------------------------
    // 1. REGISTER ACTIONS
    // ---------------------------------------------------------
    console.log(`[${vp.name}] 1. Register Screen...`);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(1200);
    await page.screenshot({ path: path.join(vpDir, '01_register_clean.png'), fullPage: true });

    try {
      await page.type('#firstName', 'TestUser', { delay: 20 });
      await page.type('#lastName', 'Account', { delay: 20 });
      await page.type('#email', 'newuser@example.com', { delay: 20 });
      await page.type('#password', 'SecretPass123', { delay: 20 });
      await delay(500);
      await page.screenshot({ path: path.join(vpDir, '02_register_filled.png'), fullPage: true });

      await safeClickButton(page, 'Sign Up');
      await delay(1500);
      await page.screenshot({ path: path.join(vpDir, '03_register_submitted.png'), fullPage: true });
    } catch (e) {
      console.warn(`Register interaction note:`, e.message);
    }

    // ---------------------------------------------------------
    // 2. FORGOT PASSWORD ACTIONS
    // ---------------------------------------------------------
    console.log(`[${vp.name}] 2. Forgot Password Screen...`);
    await page.goto(`${BASE_URL}/forgetPassword`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(1200);
    await page.screenshot({ path: path.join(vpDir, '04_forgot_password_clean.png'), fullPage: true });

    try {
      const emailInput = await page.$('input[type="email"], input#email');
      if (emailInput) {
        await emailInput.type(EMAIL, { delay: 20 });
        await delay(500);
        await page.screenshot({ path: path.join(vpDir, '05_forgot_password_filled.png'), fullPage: true });
      }
    } catch (e) {
      console.warn(`Forgot password interaction note:`, e.message);
    }

    // ---------------------------------------------------------
    // 3. LOGIN ACTIONS
    // ---------------------------------------------------------
    console.log(`[${vp.name}] 3. Login Screen...`);
    await page.goto(`${BASE_URL}/Login`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(1200);
    await page.screenshot({ path: path.join(vpDir, '06_login_clean.png'), fullPage: true });

    try {
      await page.type('#email', EMAIL, { delay: 25 });
      await page.type('#password', PASS, { delay: 25 });
      await delay(500);
      await page.screenshot({ path: path.join(vpDir, '07_login_credentials_entered.png'), fullPage: true });

      await safeClickButton(page, 'Sign In');
      await delay(2000);
      await page.screenshot({ path: path.join(vpDir, '08_login_success_alert.png'), fullPage: true });
    } catch (e) {
      console.warn(`Login note:`, e.message);
    }

    // Ensure session token is stored in localStorage
    await page.evaluate((tok) => {
      localStorage.setItem('token', tok);
    }, token);

    // ---------------------------------------------------------
    // 4. DASHBOARD VIEW
    // ---------------------------------------------------------
    console.log(`[${vp.name}] 4. Main Dashboard View...`);
    await page.goto(`${BASE_URL}/DashBoard`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2500);
    await page.screenshot({ path: path.join(vpDir, '09_dashboard_view.png'), fullPage: true });

    // ---------------------------------------------------------
    // 5. INCOME ACTIONS (Add Data & Verify)
    // ---------------------------------------------------------
    console.log(`[${vp.name}] 5. Income Screen & Add Data...`);
    await page.goto(`${BASE_URL}/Dashboard/Income`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2000);
    await page.screenshot({ path: path.join(vpDir, '10_income_initial_table.png'), fullPage: true });

    console.log(`[${vp.name}] Triggering Add Income Modal...`);
    await safeClickButton(page, 'Add Income');
    await delay(1200);

    try {
      const incInput = await page.$('input#Income');
      if (incInput) {
        await incInput.click({ clickCount: 3 });
        await incInput.type('95000', { delay: 30 });
      }
      const catInput = await page.$('input#Category');
      if (catInput) {
        await catInput.click({ clickCount: 3 });
        await catInput.type('Client Milestone Bonus', { delay: 30 });
      }
      const descInput = await page.$('input#Description');
      if (descInput) {
        await descInput.click({ clickCount: 3 });
        await descInput.type('Full Project Sign-off & Delivery', { delay: 30 });
      }
      await delay(800);
      await page.screenshot({ path: path.join(vpDir, '11_income_modal_data_entered.png'), fullPage: true });

      // Click Add inside the modal dialog
      await page.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"]');
        if (dialog) {
          const submitBtn = dialog.querySelector('button[type="submit"]') || Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.includes('Add'));
          if (submitBtn) submitBtn.click();
        }
      });
      await delay(2500);
      await page.screenshot({ path: path.join(vpDir, '12_income_table_after_record_added.png'), fullPage: true });

      // Search Action
      const searchInputs = await page.$$('input[placeholder="Search..."]');
      if (searchInputs.length > 0) {
        await searchInputs[0].click({ clickCount: 3 });
        await searchInputs[0].type('Milestone', { delay: 30 });
        await delay(1200);
        await page.screenshot({ path: path.join(vpDir, '13_income_search_filter_applied.png'), fullPage: true });
      }
    } catch (e) {
      console.warn(`Income action note:`, e.message);
    }

    // ---------------------------------------------------------
    // 6. EXPENSE ACTIONS (Add Data & Verify)
    // ---------------------------------------------------------
    console.log(`[${vp.name}] 6. Expense Screen & Add Data...`);
    await page.goto(`${BASE_URL}/Dashboard/Expense`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2000);
    await page.screenshot({ path: path.join(vpDir, '14_expense_initial_table.png'), fullPage: true });

    console.log(`[${vp.name}] Triggering Add Expense Modal...`);
    await safeClickButton(page, 'Add Expense');
    await delay(1200);

    try {
      const today = new Date().toISOString().split('T')[0];
      const dateInp = await page.$('input#Date');
      if (dateInp) {
        await dateInp.click();
        await dateInp.type(today);
      }
      const expInp = await page.$('input#Expense');
      if (expInp) {
        await expInp.click({ clickCount: 3 });
        await expInp.type('18500', { delay: 30 });
      }
      const expCat = await page.$('input#Category');
      if (expCat) {
        await expCat.click({ clickCount: 3 });
        await expCat.type('Cloud Infrastructure', { delay: 30 });
      }
      const expDesc = await page.$('input#Description');
      if (expDesc) {
        await expDesc.click({ clickCount: 3 });
        await expDesc.type('Annual AWS Hosting & DB Instances', { delay: 30 });
      }
      await delay(800);
      await page.screenshot({ path: path.join(vpDir, '15_expense_modal_data_entered.png'), fullPage: true });

      await page.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"]');
        if (dialog) {
          const submitBtn = dialog.querySelector('button[type="submit"]') || Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.includes('Add'));
          if (submitBtn) submitBtn.click();
        }
      });
      await delay(2500);
      await page.screenshot({ path: path.join(vpDir, '16_expense_table_after_record_added.png'), fullPage: true });
    } catch (e) {
      console.warn(`Expense action note:`, e.message);
    }

    // ---------------------------------------------------------
    // 7. EDIT PROFILE ACTIONS
    // ---------------------------------------------------------
    console.log(`[${vp.name}] 7. Edit Profile Screen...`);
    await page.goto(`${BASE_URL}/EditProfile`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2000);
    await page.screenshot({ path: path.join(vpDir, '17_profile_before_edit.png'), fullPage: true });

    try {
      const inputs = await page.$$('input[type="text"]');
      if (inputs.length >= 3) {
        await inputs[1].click({ clickCount: 3 });
        await inputs[1].type('Jay Gurjar', { delay: 25 });
        await inputs[2].click({ clickCount: 3 });
        await inputs[2].type('Lead Engineer', { delay: 25 });
        await delay(600);
        await page.screenshot({ path: path.join(vpDir, '18_profile_form_modified.png'), fullPage: true });

        await safeClickButton(page, 'Save');
        await delay(2000);
        await page.screenshot({ path: path.join(vpDir, '19_profile_saved_success_alert.png'), fullPage: true });
      }
    } catch (e) {
      console.warn(`Profile edit note:`, e.message);
    }

    // ---------------------------------------------------------
    // 8. OVERVIEW ANALYTICS (Reflecting All Added Records)
    // ---------------------------------------------------------
    console.log(`[${vp.name}] 8. Overview Analytics Final State...`);
    await page.goto(`${BASE_URL}/Dashboard/Overview`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(3000);
    await page.screenshot({ path: path.join(vpDir, '20_overview_analytics_final.png'), fullPage: true });

    await page.close();
  }

  await browser.close();
  console.log("\nALL 20 ACTIONS ACROSS ALL SCREENS AND VIEWPORTS COMPLETE!");
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
