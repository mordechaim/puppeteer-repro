'use server';

import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

const launch = async () => {
  return await puppeteer.launch({
    pipe: true,
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
  const tab = await browser.newPage();
  await tab.setContent(html, {
    timeout: 0,
    waitUntil: ['load'],
  });

  const bytes = await tab.screenshot({
    type: 'png',
    fullPage: true,
    omitBackground: true,
  });
  browser.process()?.kill();

  return Buffer.from(bytes).toString('base64');
};
