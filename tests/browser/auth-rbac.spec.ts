import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
test.use({ baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4322' });
const password = 'TeamJobs123!';
const editorEmail = 'editor.browser@example.test';
const adminEmail = 'admin.browser@example.test';
async function login(page: Page, email: string) {
  await page.goto('/auth/');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Sesión activa' }),
  ).toBeVisible();
}
async function logout(page: Page) {
  await page.goto('/auth/');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(
    page.getByRole('heading', { name: 'Iniciar sesión' }),
  ).toBeVisible();
}

async function expectNoPageErrors(page: Page, action: () => Promise<void>) {
  const errors: string[] = [];
  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  };
  const onPageError = (error: Error) => errors.push(`page: ${error.message}`);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  try {
    await action();
    expect(errors).toEqual([]);
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
}

test('public blog renders an empty state before any post is published', async ({
  page,
}) => {
  await expectNoPageErrors(page, async () => {
    await page.goto('/blog/');
    await expect(
      page.getByRole('heading', { name: 'Explora contenido de interés' }),
    ).toBeVisible();
    await expect(page.locator('[data-blog-empty]')).toHaveText(
      'Todavía no hay publicaciones publicadas.',
    );
  });
});

test('signup reader session persists and is denied editor access', async ({
  page,
}) => {
  const email = `reader-${Date.now()}@example.test`;
  await page.goto('/auth/');
  await page.getByRole('button', { name: 'Crear una cuenta' }).click();
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Sesión activa' }),
  ).toBeVisible();
  await expect(page.getByText('Lector')).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).some((key) => key.includes('auth-token')),
    ),
  ).toBe(true);
  await page.goto('/editor/');
  await expect(page.getByRole('alert')).toContainText('No tienes permisos');
  await logout(page);
});

test('editor owns drafts and has no publish control', async ({ page }) => {
  await login(page, editorEmail);
  await page.goto('/editor/');
  await expect(page.getByRole('heading', { name: 'Borradores' })).toBeVisible();
  await expect(page.getByText('Borrador de prueba')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publicar' })).toHaveCount(0);
  await logout(page);
});

test('admin manages users and publishes a draft', async ({ page }) => {
  await login(page, adminEmail);
  await page.goto('/admin/');
  await expect(
    page.getByRole('heading', { name: 'Administración' }),
  ).toBeVisible();
  await expect(page.getByText('Editor browser')).toBeVisible();
  const seededDraft = page
    .locator('article')
    .filter({ has: page.locator('input[value="Borrador de prueba"]') });
  await expect(seededDraft).toBeVisible();
  await seededDraft.getByLabel('Slug').fill('arbitrary-public-slug');
  await seededDraft.getByRole('button', { name: 'Guardar edición' }).click();
  await expect(page.getByText('Publicación editada.')).toBeVisible();
  await seededDraft.getByRole('button', { name: 'Publicar' }).click();
  await expect(page.getByText('Estado: published')).toBeVisible();
  await page.getByRole('button', { name: 'Suspender' }).first().click();
  await expect(page.getByText('Cuenta actualizada.')).toBeVisible();
});

test('public blog lists an arbitrary published slug and sanitizes its Markdown', async ({
  page,
}) => {
  await expectNoPageErrors(page, async () => {
    await page.goto('/blog');
    await expect(page.locator('[data-blog-list]')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Borrador de prueba' }),
    ).toHaveAttribute('href', '/blog/arbitrary-public-slug');

    await page.goto('/blog/arbitrary-public-slug/');
    await expect(
      page.getByRole('heading', { name: 'Borrador de prueba' }),
    ).toBeVisible();
    const markdown = page.locator('[data-blog-markdown]');
    await expect(markdown).toContainText('Enlace inseguro');
    await expect(markdown.locator('script')).toHaveCount(0);
    await expect(markdown.locator('img')).toHaveCount(0);
    await expect(markdown.locator('a[href^="javascript:"]')).toHaveCount(0);
    expect(await markdown.innerHTML()).not.toMatch(/on\w+\s*=/i);
    expect(
      await page.evaluate(() =>
        Boolean((window as Window & { __blogXss?: boolean }).__blogXss),
      ),
    ).toBe(false);

    const body = (await page.locator('body').textContent()) ?? '';
    expect(body).not.toContain('editor.browser@example.test');
    expect(body).not.toContain('admin.browser@example.test');
    expect(body).not.toContain('Administrador');
    expect(body).not.toContain('Lector');
  });
});

test('public, malformed, and extra-segment routes share one non-disclosing not-found state', async ({
  page,
}) => {
  await expectNoPageErrors(page, async () => {
    const states: string[] = [];
    for (const pathname of [
      '/blog/unknown-public-slug',
      '/blog/browser-private-draft/',
      '/blog/browser-archived/',
      '/blog/arbitrary-public-slug/extra',
      '/blog/foo--bar',
    ]) {
      await page.goto(pathname);
      const notFound = page.locator('[data-blog-not-found]');
      await expect(notFound).toBeVisible();
      states.push(await notFound.innerText());
    }

    expect(new Set(states).size).toBe(1);
    expect(states[0]).not.toContain('Borrador de prueba');
  });
});
