import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('clavis-lab-config-v1'))
    await page.addInitScript(() => localStorage.removeItem('clavis-lab-theme'))
})

test.afterEach(async ({ page }) => {
    await page.mouse.up().catch(() => null)
})

async function enterBoardBuilder(page: import('@playwright/test').Page) {
    await page.goto('/')
    await page.waitForSelector('.board-wrap .board', { timeout: 8000 })
    await page.locator('.layout-trigger').click()
    await expect(page.locator('.layout-menu')).toBeVisible()
    await page.locator('.lm-new').click()
    await expect(page.locator('.modal')).toBeVisible()
    await page.locator('.modal input.txt').fill('CustomBoard')
    await page.locator('.modal .opt').nth(2).click()
    await page.locator('.modal .btn.primary').click()
    await expect(page.locator('.board-sidebar')).toBeVisible({ timeout: 5000 })
    // First stamp (1U matrix) is auto-active after entering builder
    await expect(page.locator('.bs-stamp').first()).toHaveClass(/active/)
}

async function placeKeyAt(page: import('@playwright/test').Page, x: number, y: number) {
    await page.locator('.stage').click({ position: { x, y } })
    await page.waitForTimeout(150)
}

async function stageCenter(page: import('@playwright/test').Page) {
    const box = await page.locator('.stage').boundingBox()
    return { x: box!.width / 2, y: box!.height / 2 }
}

test('creating custom layout enters board builder mode', async ({ page }) => {
    await enterBoardBuilder(page)
    await expect(page.locator('.stage.edit-mode')).toBeVisible()
    await expect(page.locator('.board-sidebar')).toBeVisible()
})

test('board builder sidebar shows stamp palette', async ({ page }) => {
    await enterBoardBuilder(page)
    const stamps = page.locator('.bs-stamp')
    expect(await stamps.count()).toBeGreaterThanOrEqual(4)
    await expect(stamps.first()).toBeVisible()
})

test('first stamp is auto-active, switching stamp updates selection', async ({ page }) => {
    await enterBoardBuilder(page)
    const stamp0 = page.locator('.bs-stamp').nth(0)
    const stamp1 = page.locator('.bs-stamp').nth(1)
    await expect(stamp0).toHaveClass(/active/)
    await expect(stamp1).not.toHaveClass(/active/)
    await stamp1.click()
    await expect(stamp1).toHaveClass(/active/)
    await expect(stamp0).not.toHaveClass(/active/)
})

test('clicking active stamp deactivates it', async ({ page }) => {
    await enterBoardBuilder(page)
    await page.locator('.bs-stamp').first().click()
    await expect(page.locator('.bs-stamp.active')).toHaveCount(0)
})

test('placing a key on canvas adds it to board', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.board-wrap .key')).toHaveCount(1, { timeout: 3000 })
})

test('placed key is auto-selected', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.board-wrap .key.selected')).toHaveCount(1)
})

test('selection overlay with 4 handles appears on selected key', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.sel-overlay')).toBeVisible()
    await expect(page.locator('.sel-handle')).toHaveCount(4)
})

test('clicking empty canvas with no stamp deselects key', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.board-wrap .key.selected')).toHaveCount(1)
    await page.locator('.bs-stamp.active').click()
    await expect(page.locator('.bs-stamp.active')).toHaveCount(0)
    const box = await page.locator('.stage').boundingBox()
    await page.locator('.stage').click({ position: { x: box!.width - 30, y: 30 } })
    await expect(page.locator('.sel-overlay')).not.toBeVisible()
})

test('can drag key to new position', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.board-wrap .key')).toHaveCount(1)
    const keyBefore = await page.locator('.board-wrap .key').first().boundingBox()
    expect(keyBefore).not.toBeNull()
    const kx = keyBefore!.x + keyBefore!.width / 2
    const ky = keyBefore!.y + keyBefore!.height / 2
    await page.mouse.move(kx, ky)
    await page.mouse.down()
    await page.mouse.move(kx + 192, ky + 128, { steps: 15 })
    await page.mouse.up()
    await page.waitForTimeout(150)
    const keyAfter = await page.locator('.board-wrap .key').first().boundingBox()
    const moved = Math.abs(keyAfter!.x - keyBefore!.x) + Math.abs(keyAfter!.y - keyBefore!.y)
    expect(moved).toBeGreaterThan(50)
})

test('corner handle drag rotates key', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.sel-handle.tr')).toBeVisible()
    const hbox = await page.locator('.sel-handle.tr').boundingBox()
    expect(hbox).not.toBeNull()
    const hx = hbox!.x + hbox!.width / 2
    const hy = hbox!.y + hbox!.height / 2
    await page.mouse.move(hx, hy)
    await page.mouse.down()
    await page.mouse.move(hx + 100, hy + 100, { steps: 15 })
    await page.mouse.up()
    await page.waitForTimeout(150)
    const styleAttr = await page.locator('.board-wrap .key').first().getAttribute('style')
    expect(styleAttr).toMatch(/rotate/)
})

test('delete key removes it from board', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.board-wrap .key')).toHaveCount(1)
    await page.locator('.be-del').click()
    await expect(page.locator('.board-wrap .key')).toHaveCount(0)
})

test('can place multiple keys', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x,       center.y)
    await placeKeyAt(page, center.x + 130, center.y)
    await placeKeyAt(page, center.x - 130, center.y)
    await expect(page.locator('.board-wrap .key')).toHaveCount(3, { timeout: 3000 })
})

test('exit button leaves board builder mode', async ({ page }) => {
    await enterBoardBuilder(page)
    await expect(page.locator('.stage.edit-mode')).toBeVisible()
    await page.locator('.bs-header .btn').click()
    await expect(page.locator('.stage.edit-mode')).not.toBeVisible()
    await expect(page.locator('.board-sidebar')).not.toBeVisible()
})

test('selected key shows finger editor in sidebar', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.bs-fingers')).toBeVisible()
    await expect(page.locator('.be-finger')).toHaveCount(10)
})

test('key editor opens on right side when key selected in builder', async ({ page }) => {
    await enterBoardBuilder(page)
    const center = await stageCenter(page)
    await placeKeyAt(page, center.x, center.y)
    await expect(page.locator('.board-wrap .key.selected')).toHaveCount(1)
    await expect(page.locator('.editor.open')).toBeVisible()
})
