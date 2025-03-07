'use client';

import { ChangeEvent, useState, useTransition } from 'react';
import { screenshot } from './browser';

export default function Home() {
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<string>();

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    startTransition(async () => {
      const { promise, resolve } = Promise.withResolvers<string>();
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };

      reader.readAsText(file);
      const html = await promise;

      setData(await screenshot(html));
    });
  };

  return (
    <div>
      {!pending && !data && (
        <label>
          Create screenshot
          <input
            type='file'
            style={{ display: 'none' }}
            onChange={handleFile}
            accept='text/html'
          />
        </label>
      )}

      {pending && <span>Generating...</span>}

      {data && (
        <img src={`data:image/png;base64,${data}`} style={{ width: '100vw' }} />
      )}
    </div>
  );
}
