import { expect, test } from 'bun:test';
import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { configStore } from '../config';
import { storage } from '../utils/storage';
import { resolveBrowserLanguage } from '../utils/reviewLanguage';
import { DecisionNoteField } from './DecisionControl';
import { ReviewLanguageProvider } from './ReviewLanguage';
import { Settings } from './Settings';

test('follows the first supported browser language, with English as the fallback', () => {
  expect(resolveBrowserLanguage(['ja', 'zh-Hans-SG', 'en'])).toBe('zh-CN');
  expect(resolveBrowserLanguage(['en-GB', 'zh-CN'])).toBe('en');
  expect(resolveBrowserLanguage(['fr'])).toBe('en');
  expect(resolveBrowserLanguage([])).toBe('en');
});

function Review() {
  const [note, setNote] = useState('Approve：请保留这条批注');
  return (
    <ReviewLanguageProvider>
      <DecisionNoteField text={note} onTextChange={setNote} onSubmit={() => {}} onCancel={() => {}} />
      <Settings mode="review" taterMode={false} onTaterModeChange={() => {}} externalOpen />
    </ReviewLanguageProvider>
  );
}

test.skipIf(typeof document === 'undefined')('changing language in Settings updates the open review and keeps its draft', async () => {
  const { happyDOM } = window as unknown as { happyDOM: { setURL(url: string): void } };
  const previousUrl = window.location.href;
  happyDOM.setURL('http://localhost:19270/');
  const original = configStore.get('reviewLanguage');
  const oldLang = document.documentElement.lang;
  const host = document.body.appendChild(document.createElement('div'));
  const root = createRoot(host);
  try {
    configStore.set('reviewLanguage', 'en');
    await act(async () => root.render(<Review />));
    const picker = document.querySelector<HTMLSelectElement>('select:has(option[value="zh-CN"])')!;
    const field = host.querySelector('textarea')!;
    expect(field.placeholder).toBe('Add a note...');
    await act(async () => {
      picker.value = 'zh-CN';
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(document.documentElement.lang).toBe('zh-CN');
    expect(document.querySelector('#plannotator-settings-title')?.textContent).toBe('设置');
    expect(field.placeholder).toBe('写下留言…');
    expect(field.value).toBe('Approve：请保留这条批注');
    expect(storage.getItem('plannotator-review-language')).toBe('zh-CN');
    await act(async () => {
      picker.value = 'en';
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(field.placeholder).toBe('Add a note...');
    expect(field.value).toBe('Approve：请保留这条批注');
  } finally {
    await act(async () => root.unmount());
    host.remove();
    configStore.set('reviewLanguage', original);
    happyDOM.setURL(previousUrl);
  }
  expect(document.documentElement.lang).toBe(oldLang);
});
