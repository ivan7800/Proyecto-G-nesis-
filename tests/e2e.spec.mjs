import { test, expect } from '@playwright/test';

test.describe('Proyecto Génesis Ω — E2E', () => {
  test.beforeEach(async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.errors = errors;
    await page.goto('/');
    await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  });

  test('arranca sin errores de consola y muestra el origen', async ({ page }) => {
    await expect(page.locator('#genesisIntro')).toBeVisible();
    await expect(page.locator('#appVersion')).toHaveText(/v5\./);
    expect(page.errors).toEqual([]);
  });


  test('zoom adaptativo, encaje completo y biomas funcionan', async ({ page }) => {
    const initial = await page.evaluate(() => {
      const { renderer } = window.__GENESIS__;
      renderer.resetCamera();
      return { zoom: renderer.camera.zoom, min: renderer.getMinZoom(), x: renderer.camera.x, y: renderer.camera.y };
    });
    expect(Math.abs(initial.zoom - initial.min)).toBeLessThan(.001);
    await page.click('#cameraZoomInBtn');
    const zoomed = await page.evaluate(() => window.__GENESIS__.renderer.camera.zoom);
    expect(zoomed).toBeGreaterThan(initial.zoom);
    await page.click('#cameraResetBtn');
    const reset = await page.evaluate(() => window.__GENESIS__.renderer.camera.zoom);
    expect(Math.abs(reset - initial.min)).toBeLessThan(.001);

    await page.selectOption('#biomeSelect', 'forest');
    await expect(page.locator('#biomeLabel')).toContainText('BOSQUE');
    expect(await page.evaluate(() => window.__GENESIS__.simulation.biome)).toBe('forest');
    await page.selectOption('#biomeSelect', 'desert');
    await expect(page.locator('#biomeLabel')).toContainText('ARENA');
    expect(page.errors).toEqual([]);
  });

  test('la barra premium y Mente Ω permiten elegir bioma y encargar proyectos', async ({ page }) => {
    await page.selectOption('#biomeQuickSelect', 'meadow');
    expect(await page.evaluate(() => window.__GENESIS__.simulation.biome)).toBe('meadow');
    await page.click('#openCollectiveBtn');
    await expect(page.locator('#tab-collective')).toBeVisible();
    await page.click('#injectAtlasBtn');
    expect(await page.evaluate(() => window.__GENESIS__.simulation.getCollectiveMetrics().uniqueKnowledge)).toBeGreaterThanOrEqual(60);
    await page.selectOption('#collectiveProjectType', 'plan');
    await page.fill('#collectivePrompt', 'mejorar el cuidado del ecosistema');
    await page.click('#collectiveProjectBtn');
    await expect(page.locator('#collectiveProjectsList')).toContainText('ecosistema');
    expect(page.errors).toEqual([]);
  });

  test('Civilización y puente externo funcionan sin API ni claves', async ({ page }) => {
    await page.click('#openCivilizationBtn');
    await expect(page.locator('#tab-civilization')).toBeVisible();
    await expect(page.locator('#societyGovernment')).toBeVisible();
    await expect(page.locator('#societyFactionList')).toBeVisible();
    await expect(page.locator('#societyDiplomacyList')).toBeVisible();
    await expect(page.locator('#societySagaList')).toBeVisible();
    await page.fill('#oracleQuestion', 'proponer un avance seguro');
    const contextDownload = page.waitForEvent('download');
    await page.click('#exportOracleBtn');
    expect((await contextDownload).suggestedFilename()).toContain('Contexto-IA');
    await page.fill('#oracleResponse', 'Primero medid los recursos. Después probad una mejora pequeña y comparad sus resultados.');
    await page.click('#integrateOracleBtn');
    await expect(page.locator('#oracleStatus')).toContainText('ideas validadas');
    expect(await page.evaluate(() => window.__GENESIS__.simulation.civilization.externalWisdom.length)).toBe(1);
    await page.locator('#openLegacyBtn').click();
    await expect(page.locator('#tab-legacy')).toBeVisible();
    await expect(page.locator('#legacyDreamList')).toBeVisible();
    expect(page.errors).toEqual([]);
  });

  test('Ω-001 eclosiona tras despertar y el linaje crece', async ({ page }) => {
    await page.click('#startGenesisBtn');
    await page.waitForFunction(() => window.__GENESIS__.simulation.creatures.length >= 1, null, { timeout: 20000 });
    await expect(page.locator('#genesisIntro')).toBeHidden();
    await page.evaluate(() => { window.__GENESIS__.simulation.speed = 12; });
    await page.waitForFunction(() => window.__GENESIS__.simulation.creatures.length >= 2, null, { timeout: 60000 });
    expect(page.errors).toEqual([]);
  });

  test('las pestañas y el panel del Taller funcionan', async ({ page }) => {
    for (const name of ['code', 'science', 'taller', 'collective', 'civilization', 'legacy', 'archive', 'god']) {
      await page.click(`#tabButton-${name}`);
      await expect(page.locator(`#tab-${name}`)).toBeVisible();
    }
  });

  test('el Taller produce una obra y el botón Entregar descarga un archivo', async ({ page }) => {
    await page.click('#startGenesisBtn');
    await page.evaluate(() => { window.__GENESIS__.simulation.speed = 12; });
    await page.waitForFunction(() => {
      const simulation = window.__GENESIS__.simulation;
      for (let i = 0; i < 400 && simulation.workshop.obras.length === 0; i++) simulation.step(.05);
      return simulation.workshop.obras.length >= 1;
    }, null, { timeout: 90000 });
    await page.click('#tabButton-taller');
    const deliverButton = page.locator('#obraList button[data-action="deliver"]').first();
    await expect(deliverButton).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await deliverButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename().length).toBeGreaterThan(4);
    const codexPromise = page.waitForEvent('download');
    await page.click('#deliverAllBtn');
    const codex = await codexPromise;
    expect(codex.suggestedFilename()).toContain('Codice');
    expect(page.errors).toEqual([]);
  });

  test('guardar y recargar conserva el mundo', async ({ page }) => {
    await page.click('#startGenesisBtn');
    await page.waitForFunction(() => window.__GENESIS__.simulation.creatures.length >= 1, null, { timeout: 20000 });
    await page.click('#tabButton-archive');
    await page.click('#saveBtn');
    await page.waitForTimeout(600);
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    await page.click('#tabButton-archive');
    await page.click('#loadBtn');
    await page.waitForFunction(() => window.__GENESIS__.simulation.genesis.phase !== 'dormant', null, { timeout: 15000 });
    expect(page.errors).toEqual([]);
  });

  test('vista móvil 390×844 sin desbordamiento horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
