'use server';

import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import path from 'path';

const launch = async () => {
  return await puppeteer.launch({
    dumpio: true,
    args: [
      ...chromium.args,
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--no-zygote',
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.CHROMIUM_LOCAL
      ? puppeteer.executablePath('chrome')
      : await chromium.executablePath(
          'https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar'
        ),
  });
};

export const screenshot = async (html: string) => {
  const browser = await launch();
  let chromeTmpDataDir = null;

  let chromeSpawnArgs = browser.process()!.spawnargs;
  for (let i = 0; i < chromeSpawnArgs.length; i++) {
    if (chromeSpawnArgs[i].indexOf('--user-data-dir=') === 0) {
      chromeTmpDataDir = chromeSpawnArgs[i].replace('--user-data-dir=', '');
    }
  }

  const tab = await browser.newPage();
  await tab.setContent(html, {
    timeout: 0,
    waitUntil: ['load'],
  });

  try {
    const bytes = await tab.screenshot({
      type: 'png',
      fullPage: true,
      omitBackground: true,
    });
    return Buffer.from(bytes).toString('base64');
  } finally {
    await browser.close();

    if (!process.env.CHROMIUM_LOCAL) {
      const entries = await fs.readdir('/tmp', { withFileTypes: true });
      console.log(entries);

      for (const entry of entries) {
        const fullPath = path.join('/tmp', entry.name);

        if (entry.name === 'chromium') {
          continue;
        }

        if (entry.isDirectory()) {
          await fs.rm(fullPath, { recursive: true, force: true });
        } else {
          await fs.unlink(fullPath);
        }
      }
    }
  }
};
