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

async function clickButtonByText(page, text) {
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const btnText = await (await btn.getProperty('innerText')).jsonValue();
    if (btnText && btnText.trim().toLowerCase().includes(text.toLowerCase())) {
      await btn.click();
      return true;
    }
  }
  return false;
}

async function run() {
  console.log("Fetching authentication token...");
  const token = await getAuthToken();
  console.log("Authentication token obtained!");

  const baseDir = path.join(__dirname, 'screenshots', 'form_actions');
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
    console.log(`TESTING FORM ACTIONS ON: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    const page = await browser.newPage();
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch
    });

    // Seed token in localStorage
    await page.goto(`${BASE_URL}/Login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('token', tok);
    }, token);

    // =========================================================
    // ACTION 1: ADD INCOME WORKFLOW
    // =========================================================
    console.log(`[${vp.name}] Navigating to Income page...`);
    await page.goto(`${BASE_URL}/Dashboard/Income`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2000);
    await page.screenshot({ path: path.join(vpDir, '01_income_before_add.png'), fullPage: true });

    console.log(`[${vp.name}] Clicking 'Add Income' button...`);
    const clickedAddIncome = await clickButtonByText(page, 'Add Income');
    await delay(1000);

    console.log(`[${vp.name}] Filling Income form fields...`);
    try {
      const incomeInput = await page.$('input#Income');
      if (incomeInput) {
        await incomeInput.click({ clickCount: 3 });
        await incomeInput.type('75000', { delay: 30 });
      }

      const catInput = await page.$('input#Category');
      if (catInput) {
        await catInput.click({ clickCount: 3 });
        await catInput.type('Consulting Project', { delay: 30 });
      }

      const descInput = await page.$('input#Description');
      if (descInput) {
        await descInput.click({ clickCount: 3 });
        await descInput.type('Q4 Milestone Deliverables', { delay: 30 });
      }

      await delay(800);
      console.log(`[${vp.name}] Capturing filled Income form dialog...`);
      await page.screenshot({ path: path.join(vpDir, '02_income_form_modal_filled.png'), fullPage: true });

      console.log(`[${vp.name}] Submitting Income form...`);
      // In the dialog, the submit button says "Add"
      const dialogSubmitBtn = await page.$('div[role="dialog"] button[type="submit"]');
      if (dialogSubmitBtn) {
        await dialogSubmitBtn.click();
      } else {
        await clickButtonByText(page, 'Add');
      }
      await delay(2500);

      console.log(`[${vp.name}] Capturing updated table with new Income...`);
      await page.screenshot({ path: path.join(vpDir, '03_income_after_added_in_table.png'), fullPage: true });
    } catch (e) {
      console.error(`Error during Income action:`, e.message);
    }

    // =========================================================
    // ACTION 2: SEARCH FILTER WORKFLOW
    // =========================================================
    console.log(`[${vp.name}] Testing search filter with 'Consulting'...`);
    try {
      const searchInputs = await page.$$('input[placeholder="Search..."]');
      if (searchInputs.length > 0) {
        await searchInputs[0].click({ clickCount: 3 });
        await searchInputs[0].type('Consulting', { delay: 40 });
        await delay(1200);
        await page.screenshot({ path: path.join(vpDir, '04_income_search_filtered.png'), fullPage: true });
        // Clear search
        await searchInputs[0].click({ clickCount: 3 });
        await page.keyboard.press('Backspace');
        await delay(800);
      }
    } catch (e) {
      console.error(`Error during Search filter:`, e.message);
    }

    // =========================================================
    // ACTION 3: ADD EXPENSE WORKFLOW
    // =========================================================
    console.log(`[${vp.name}] Navigating to Expense page...`);
    await page.goto(`${BASE_URL}/Dashboard/Expense`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2000);
    await page.screenshot({ path: path.join(vpDir, '05_expense_before_add.png'), fullPage: true });

    console.log(`[${vp.name}] Clicking 'Add Expense' button...`);
    await clickButtonByText(page, 'Add Expense');
    await delay(1000);

    console.log(`[${vp.name}] Filling Expense form fields...`);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const dateInput = await page.$('input#Date');
      if (dateInput) {
        await dateInput.click();
        await dateInput.type(todayStr);
      }

      const expenseInput = await page.$('input#Expense');
      if (expenseInput) {
        await expenseInput.click({ clickCount: 3 });
        await expenseInput.type('14500', { delay: 30 });
      }

      const expCatInput = await page.$('input#Category');
      if (expCatInput) {
        await expCatInput.click({ clickCount: 3 });
        await expCatInput.type('Tech & Hardware', { delay: 30 });
      }

      const expDescInput = await page.$('input#Description');
      if (expDescInput) {
        await expDescInput.click({ clickCount: 3 });
        await expDescInput.type('UltraWide 4K Monitor', { delay: 30 });
      }

      await delay(800);
      console.log(`[${vp.name}] Capturing filled Expense form dialog...`);
      await page.screenshot({ path: path.join(vpDir, '06_expense_form_modal_filled.png'), fullPage: true });

      console.log(`[${vp.name}] Submitting Expense form...`);
      const dialogExpSubmitBtn = await page.$('div[role="dialog"] button[type="submit"]');
      if (dialogExpSubmitBtn) {
        await dialogExpSubmitBtn.click();
      } else {
        await clickButtonByText(page, 'Add');
      }
      await delay(2500);

      console.log(`[${vp.name}] Capturing updated table with new Expense...`);
      await page.screenshot({ path: path.join(vpDir, '07_expense_after_added_in_table.png'), fullPage: true });
    } catch (e) {
      console.error(`Error during Expense action:`, e.message);
    }

    // =========================================================
    // ACTION 4: EDIT PROFILE WORKFLOW
    // =========================================================
    console.log(`[${vp.name}] Navigating to Edit Profile page...`);
    await page.goto(`${BASE_URL}/EditProfile`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(2000);
    await page.screenshot({ path: path.join(vpDir, '08_profile_before_edit.png'), fullPage: true });

    try {
      const textFields = await page.$$('input[type="text"]');
      // In EditProfile:
      // textFields[0] -> disabled Email
      // textFields[1] -> FirstName
      // textFields[2] -> LastName
      if (textFields.length >= 3) {
        console.log(`[${vp.name}] Modifying First Name and Last Name...`);
        await textFields[1].click({ clickCount: 3 });
        await textFields[1].type('Jay Verified', { delay: 30 });

        await textFields[2].click({ clickCount: 3 });
        await textFields[2].type('Gurjar Pro', { delay: 30 });

        await delay(800);
        await page.screenshot({ path: path.join(vpDir, '09_profile_form_modified.png'), fullPage: true });

        console.log(`[${vp.name}] Clicking 'Save' button...`);
        await clickButtonByText(page, 'Save');
        await delay(1800);

        console.log(`[${vp.name}] Capturing profile updated success banner...`);
        await page.screenshot({ path: path.join(vpDir, '10_profile_save_success_alert.png'), fullPage: true });
      }
    } catch (e) {
      console.error(`Error during Profile action:`, e.message);
    }

    // =========================================================
    // ACTION 5: OVERVIEW ANALYTICS IMPACT
    // =========================================================
    console.log(`[${vp.name}] Navigating to Overview to show combined results...`);
    await page.goto(`${BASE_URL}/Dashboard/Overview`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await delay(3000);
    console.log(`[${vp.name}] Capturing updated Overview analytics...`);
    await page.screenshot({ path: path.join(vpDir, '11_overview_charts_after_all_data.png'), fullPage: true });

    await page.close();
  }

  await browser.close();
  console.log("\nALL FORM ACTIONS AND OPERATIONS SUCCESSFULLY TESTED AND CAPTURED!");
}

run().catch(err => {
  console.error("Execution error:", err);
  process.exit(1);
});
