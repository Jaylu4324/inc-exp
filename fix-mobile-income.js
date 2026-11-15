const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  await page.goto('http://localhost:3000/Login');
  await page.evaluate(async () => {
    const res = await fetch('http://localhost:5000/User/Login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: 'jaygurjar3045@gmail.com', Password: 'Jay4324' })
    });
    const d = await res.json();
    localStorage.setItem('token', d.token);
  });

  await page.goto('http://localhost:3000/Dashboard/Income');
  await new Promise(r => setTimeout(r, 2000));
  
  // Click ADD INCOME button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.innerText && b.innerText.toUpperCase().includes('ADD INCOME'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.type('input#Income', '42000');
  await page.type('input#Category', 'Mobile Freelance');
  await page.type('input#Description', 'App Feature Delivery');
  await page.screenshot({ path: 'd:/inc-exp/screenshots/all_actions/mobile/11_income_modal_data_entered.png', fullPage: true });

  await page.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"]');
    if (dialog) {
      const btn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.toUpperCase().includes('ADD'));
      if (btn) btn.click();
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'd:/inc-exp/screenshots/all_actions/mobile/12_income_table_after_record_added.png', fullPage: true });

  const searchInp = await page.$('input[placeholder="Search..."]');
  if (searchInp) {
    await searchInp.type('Freelance');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'd:/inc-exp/screenshots/all_actions/mobile/13_income_search_filter_applied.png', fullPage: true });
  }

  await browser.close();
  console.log('Mobile Income Actions Successfully Captured!');
})();
