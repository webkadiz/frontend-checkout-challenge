import { expect, test, type Page } from '@playwright/test';

async function checkoutForm(page: Page) {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Увеличить количество: Настольная лампа «Орбита»', exact: true })
    .click();
  await expect(page.getByRole('button', { name: 'Корзина 1', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Корзина 1', exact: true }).click();
  await expect(page).toHaveURL(/#\/checkout$/);
  await page
    .getByRole('textbox', { name: 'Имя и фамилия', exact: true })
    .fill('Тестовый Покупатель');
  await page.getByRole('textbox', { name: 'Имя и фамилия', exact: true }).press('Tab');
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeFocused();
  await page.keyboard.type('buyer@example.test');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Телефон', exact: true })).toBeFocused();
  await page.keyboard.type('9991234567');
  await expect(page.getByRole('textbox', { name: 'Телефон', exact: true })).toHaveValue(
    '+7 999 123 45 67',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test('card selection survives reload; cancel, decline and retry keep the same order', async ({
  page,
}) => {
  await checkoutForm(page);
  await page.getByRole('button', { name: 'Перейти к оплате', exact: true }).click();
  await page.getByRole('button', { name: 'Открыть форму оплаты', exact: true }).click();

  const orderUrl = page.url();

  await page.reload();
  await expect(page.getByRole('radio', { name: /успешная оплата/ })).toBeVisible();
  await page.getByRole('button', { name: 'Отменить оплату', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Оплата отменена.', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Повторить оплату', exact: true }).click();
  await page.getByRole('radio', { name: /отказ банка/ }).check();
  await page.getByRole('button', { name: /^Оплатить / }).click();
  await expect(page.getByRole('heading', { name: 'Карта не прошла.', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Повторить оплату', exact: true }).click();
  await page.getByRole('radio', { name: /успешная оплата/ }).check();
  await page.getByRole('button', { name: /^Оплатить / }).click();
  await expect(page.getByRole('heading', { name: 'Спасибо за заказ.', exact: true })).toBeVisible();
  await expect(page).toHaveURL(orderUrl);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Спасибо за заказ.', exact: true })).toBeVisible();
});

test('lost order response survives reload and retries the exact request only once', async ({
  page,
}) => {
  await checkoutForm(page);

  const attempts: { body: string | null; key: string | undefined }[] = [];

  await page.route('**/api/orders', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();

    attempts.push({
      body: route.request().postData(),
      key: route.request().headers()['idempotency-key'],
    });

    const response = await route.fetch();

    expect(response.ok()).toBe(true);

    if (attempts.length === 1) await route.abort('failed');
    else await route.fulfill({ response });
  });
  await page.getByRole('button', { name: 'Перейти к оплате', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Проверить создание заказа', exact: true }),
  ).toBeEnabled();
  await page.reload();
  await page.getByRole('button', { name: 'Проверить создание заказа', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Открыть форму оплаты', exact: true }),
  ).toBeVisible();
  expect(attempts).toHaveLength(2);
  expect(attempts[0].key).toBeTruthy();
  expect(attempts[1]).toEqual(attempts[0]);
});

test('browser Back restores the catalog; cash checkout works with the keyboard', async ({
  page,
}) => {
  await checkoutForm(page);
  await page.goBack();
  await expect(page.getByRole('region', { name: 'Каталог', exact: true })).toBeVisible();
  await page.goForward();
  await page.getByRole('radio', { name: /При получении/ }).check();

  const submit = page.getByRole('button', { name: 'Оформить заказ', exact: true });

  await submit.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Спасибо за заказ.', exact: true })).toBeVisible();
  await expect(
    page.getByText('Заказ оформлен, оплата при получении', { exact: true }),
  ).toBeVisible();
});
