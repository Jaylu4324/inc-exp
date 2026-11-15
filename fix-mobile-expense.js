const puppeteer = require('puppeteer-core');

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

  await page.goto('http://localhost:3000/Dashboard/Expense');
  await new Promise(r => setTimeout(r, 2000));
  
  // Trigger click properly with bubbles
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find(b => b.innerText && b.innerText.toUpperCase().includes('ADD EXPENSE'));
    if (target) {
      target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });

  // Wait for dialog selector
  await page.waitForSelector('input#Expense', { timeout: 5000 }).catch(e => console.log('Selector wait:', e.message));

  const hasDialog = await page.$('input#Expense');
  console.log('Dialog opened:', !!hasDialog);

  if (hasDialog) {
    const today = new Date().toISOString().split('T')[0];
    const dateInp = await page.$('input#Date');
    if (dateInp) {
      await dateInp.type(today);
    }
    await page.type('input#Expense', '18500');
    await page.type('input#Category', 'Mobile Server Testing');
    await page.type('input#Description', 'Performance Benchmarking');
    await page.screenshot({ path: 'd:/inc-exp/screenshots/all_actions/mobile/15_expense_modal_data_entered.png', fullPage: true });

    await page.evaluate(() => {
      const dialog = document.querySelector('div[role="dialog"]');
      if (dialog) {
        const btn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.toUpperCase().includes('ADD'));
        if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: 'd:/inc-exp/screenshots/all_actions/mobile/16_expense_table_after_record_added.png', fullPage: true });
    console.log('Mobile Expense captures updated successfully!');
  }

  await browser.close();
})();
