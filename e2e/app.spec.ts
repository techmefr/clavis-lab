import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('clavis-lab-config-v1'))
    await page.addInitScript(() => localStorage.removeItem('clavis-lab-theme'))
    await page.goto('/')
    await page.waitForSelector('.board-wrap .board', { timeout: 8000 })
})

test('app loads with keyboard visible', async ({ page }) => {
    await expect(page.locator('.brand .logo')).toContainText('clavis')
    await expect(page.locator('.board-wrap .board')).toBeVisible()
    const keys = page.locator('.board-wrap .key')
    expect(await keys.count()).toBeGreaterThan(10)
})

test('layout picker opens and lists layouts', async ({ page }) => {
    const trigger = page.locator('.layout-trigger')
    await expect(trigger).toBeVisible()
    await trigger.click()
    await expect(page.locator('.layout-menu')).toBeVisible()
    const items = page.locator('.lm-item:not(.lm-new):not(.lm-del):not(.lm-build)')
    expect(await items.count()).toBeGreaterThanOrEqual(1)
})

test('layout picker closes on outside click', async ({ page }) => {
    await page.locator('.layout-trigger').click()
    await expect(page.locator('.layout-menu')).toBeVisible()
    await page.locator('.brand').click()
    await expect(page.locator('.layout-menu')).not.toBeVisible()
})

test('clicking a key opens the key editor panel', async ({ page }) => {
    await expect(page.locator('.editor.open')).toHaveCount(0)
    const firstKey = page.locator('.board-wrap .key').first()
    await firstKey.click()
    await expect(page.locator('.editor.open')).toBeVisible()
    await expect(page.locator('.editor .ehead .t')).toBeVisible()
})

test('key editor closes with X button', async ({ page }) => {
    await page.locator('.board-wrap .key').first().click()
    await expect(page.locator('.editor.open')).toBeVisible()
    await page.locator('.editor button[aria-label="close"]').click()
    await expect(page.locator('.editor.open')).toHaveCount(0)
})

test('layer rail shows at least one chip', async ({ page }) => {
    await expect(page.locator('.rail-track')).toBeVisible()
    const chips = page.locator('.chip')
    expect(await chips.count()).toBeGreaterThanOrEqual(1)
    await expect(chips.first()).toHaveClass(/active/)
})

test('can add a layer via + button', async ({ page }) => {
    const before = await page.locator('.chip').count()
    await page.locator('.chip-add').click()
    await expect(page.locator('.modal')).toBeVisible()
    await page.locator('.modal input.txt').fill('TestLayer')
    await page.locator('.modal .btn.primary').click()
    await expect(page.locator('.chip')).toHaveCount(before + 1)
})

test('settings panel opens and closes', async ({ page }) => {
    await page.locator('.settings-btn').click()
    await expect(page.locator('.settings-panel')).toBeVisible()
    await page.locator('.brand').click()
    await expect(page.locator('.settings-panel')).not.toBeVisible()
})

test('theme toggle switches dark/light', async ({ page }) => {
    const html = page.locator('html')
    await page.locator('.settings-btn').click()
    await expect(page.locator('.settings-panel')).toBeVisible()
    const initial = await html.getAttribute('data-theme')
    const themeRow = page.locator('.sp-row').filter({ has: page.locator('.seg') }).last()
    const inactiveBtn = themeRow.locator('.seg button:not(.on)')
    await inactiveBtn.first().click()
    const after = await html.getAttribute('data-theme')
    expect(after).not.toBe(initial)
})

test('new layout modal shows all 3 options', async ({ page }) => {
    await page.locator('.layout-trigger').click()
    await expect(page.locator('.layout-menu')).toBeVisible()
    await page.locator('.lm-new').click()
    await expect(page.locator('.modal')).toBeVisible()
    const opts = page.locator('.modal .opt')
    await expect(opts).toHaveCount(3)
    await expect(opts.nth(0).locator('.opt-main')).toContainText('Cheapino V2')
    await expect(opts.nth(2).locator('.opt-sub')).toContainText(/scratch|zéro/)
})

test('new blank layout creates a layout', async ({ page }) => {
    await page.locator('.layout-trigger').click()
    await expect(page.locator('.layout-menu')).toBeVisible()
    const before = await page.locator('.lm-item:not(.lm-new):not(.lm-del):not(.lm-build)').count()
    await page.locator('.lm-new').click()
    await expect(page.locator('.modal')).toBeVisible()
    await page.locator('.modal input.txt').fill('MonLayout')
    await page.locator('.modal .opt').first().click()
    await page.locator('.modal .btn.primary').click()
    await expect(page.locator('.layout-trigger .lt-name')).toContainText('MonLayout')
    await page.locator('.layout-trigger').click()
    await expect(page.locator('.layout-menu')).toBeVisible()
    const after = await page.locator('.lm-item:not(.lm-new):not(.lm-del):not(.lm-build)').count()
    expect(after).toBe(before + 1)
})
