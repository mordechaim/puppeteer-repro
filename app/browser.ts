'use server';

import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

const launch = async () => {
  return await puppeteer.launch({
    dumpio: true,
    args: chromium.args,
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
  const tab = await browser.newPage();
  await tab.setContent(html, {
    timeout: 0,
    waitUntil: ['load'],
  });

  await tab.setViewport({
    width: Math.round(4950 / 4),
    height: Math.round(7650 / 4),
    deviceScaleFactor: 4,
  });

  try {
    const bytes = await tab.screenshot({
      type: 'png',
      omitBackground: true,
    });
    return Buffer.from(bytes).toString('base64');
  } finally {
    await browser.close();
  }
};
