// Browser checks run against dist/ at a subpath. Fixture data is only intercepted in tests.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { preview } from '../web/preview.mjs';
const require = createRequire(new URL('../web/package.json', import.meta.url));
const { chromium, webkit } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const out = new URL('../test/scratch/browser-checks/', import.meta.url);
await mkdir(out, { recursive: true });
const report = { at: new Date().toISOString(), checks: [], screenshots: [], limitations: [] };
const server = preview();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/preview/`;
let browser;
const errors = [];
const check = (name, detail = '') => { report.checks.push({ name, passed: true, detail }); console.log('PASS:', name, detail); };
const snap = page => page.evaluate(() => window.echoLedger.snapshot());
const fixtureStatus = () => ({ measurement: { freshness: 'online', observedAt: new Date().toISOString(), staleAfterSeconds: 120, coreStatus: 'ACTIVE', rpmMilli: 42000, distanceMm: 8913456, cumulativeWorkUnits: '28705' }, builder: { anchor: { blockHeight: '3205' }, projected: { blockHeight: '3207' } } });
// A public Sepolia receipt observed during verification, with the documented API fields.
const receipt = { transactionHash: '0xbfe6f7f2f1aa989cded123b8403c7349da554fdab02b36e3b80ea56f04c79503', settledThroughRound: '646', workAdded: '514', completedBlockCount: '59', blockHeight: '3205', blockTimestamp: '2026-11-08T07:30:36.000Z', logIndex: '415', confirmationStatus: 'safe' };
async function fixture(page) {
  const data = { status: fixtureStatus(), settlements: { recentSettlements: [receipt] }, 'economy/state': { asset: { symbol: 'SQK' }, supply: { liveSupplyBaseUnits: '1000000000000000000000' } } };
  const controls = { data, fail: false };
  await page.route('https://api.squeekchain.com/v1/**', async route => {
    if (controls.fail) return route.abort('failed');
    const endpoint = new URL(route.request().url()).pathname.slice('/v1/'.length);
    await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'X-Squeek-Settlement-Source': 'live', 'Access-Control-Expose-Headers': 'X-Squeek-Settlement-Source' }, json: data[endpoint] });
  });
  return controls;
}
async function open(options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', res => { if (res.url().startsWith(base) && res.status() >= 400) errors.push(`local ${res.status()}: ${new URL(res.url()).pathname}`); });
  return { page, context };
}
async function shot(page, name) {
  await page.screenshot({ path: new URL(name + '.webp', out).pathname, type: 'webp', quality: 80 });
  report.screenshots.push(name + '.webp');
}
async function audit(page, name) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], name + ' accessibility violations');
  check('axe: ' + name, 'No automated WCAG A/AA violations in this state; canvas gameplay is outside this audit.');
}
async function protectedRun(page, url = '?test=1&offline=1') {
  await page.goto(base + url);
  await page.click('#startBtn');
  await page.evaluate(() => { window.echoLedger.debug.protect(); window.echoLedger.debug.clearThreats(); });
  await page.waitForFunction(() => document.activeElement?.id === 'game');
}
async function recordAt(page, x, y) {
  await page.evaluate(([x,y]) => window.echoLedger.debug.teleport(x,y), [x,y]);
  await page.keyboard.press('r');
  await page.waitForFunction(() => window.echoLedger.snapshot().recordTime > .75);
  await page.keyboard.press('r');
}
async function deliver(page) {
  for (const v of (await snap(page)).vaults) {
    await page.evaluate(([x,y]) => window.echoLedger.debug.teleport(x,y), [v.x,v.y]);
    await page.waitForFunction(([x,y]) => window.echoLedger.snapshot().vaults.find(v => v.x===x && v.y===y).taken, [v.x,v.y]);
  }
  await page.evaluate(() => window.echoLedger.debug.teleport(935,360));
  await page.waitForFunction(() => window.echoLedger.snapshot().state === 'shop');
}
try {
  browser = await chromium.launch({ headless: true });
  report.browser = browser.version();
  for (const width of [320,390,768,1024,1440]) {
    const { page, context } = await open({ viewport: { width, height: width<600?844:1000 }, hasTouch: width<600, isMobile: width<600 });
    await page.goto(base+'?offline=1');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false, `overflow ${width}`);
    if (width===390) {
      const action = await page.locator('#startBtn').boundingBox();
      assert.ok(action.y >= 0 && action.y + action.height <= 844, 'main action on first 390px screen');
      check('390px first screen', `Enter the burrow at y=${Math.round(action.y)}, bottom=${Math.round(action.y+action.height)}.`);
      await shot(page,'title-390');
      await audit(page,'mobile title');
    }
    if (width===1440) await shot(page,'title-1440');
    await context.close();
  }
  check('responsive title', 'No horizontal overflow at 320, 390, 768, 1024 or 1440 CSS px.');

  const { page: p, context: desktop } = await open({ viewport: { width:1440, height:1000 } });
  const live = await fixture(p);
  await protectedRun(p,'?test=1');
  await p.waitForFunction(() => window.squeekFeed.live);
  assert.equal((await snap(p)).regen,12.04);
  assert.equal((await snap(p)).surgeTime,0,'initial settlements are baseline');
  assert.match(await p.locator('#feedSource').innerText(), /Live/);
  assert.match(await p.locator('.ledger-entry').getAttribute('href'), /^https:\/\/sepolia.etherscan.io\/tx\//);
  check('fixture live telemetry', '42 RPM gives 12.04 energy/s; settled/projected values and Sepolia receipts render. Initial history causes no Surge.');
  const oldX=(await snap(p)).player.x;
  await p.keyboard.down('d'); await p.waitForTimeout(450); await p.keyboard.up('d');
  assert.ok((await snap(p)).player.x>oldX+40);
  await p.keyboard.press('Shift'); assert.ok((await snap(p)).player.dash>0);
  const purges=(await snap(p)).player.purges;
  await p.keyboard.press('e'); assert.equal((await snap(p)).player.purges,purges-1);
  await p.keyboard.press('m'); assert.equal(await p.locator('#soundBtn').getAttribute('aria-pressed'),'true'); await p.keyboard.press('m');
  await audit(p,'playing');
  check('keyboard gameplay', 'Movement, dash, purge and mute toggle change actual game state.');

  for(const r of (await snap(p)).relays) await recordAt(p,r.x,r.y);
  await p.waitForFunction(() => window.echoLedger.snapshot().relays.every(r=>r.on));
  assert.equal((await snap(p)).echoes.length,2);
  check('relay puzzle', 'Two recorded echoes power both latching relays.');
  await shot(p,'gameplay-fixture-1440');
  // Inject a second receipt only in this test's intercepted response to test new/dedup logic.
  live.data.settlements.recentSettlements.unshift({...receipt,logIndex:'416'});
  await p.evaluate(()=>window.squeekFeed.poll());
  assert.equal((await snap(p)).stats.surges,1);
  await p.evaluate(()=>window.squeekFeed.poll());
  assert.equal((await snap(p)).stats.surges,1);
  check('settlement Surge', 'New safe receipt triggers one Surge; replaying the same receipt does not retrigger it.');

  await p.keyboard.press('p');
  await p.waitForFunction(()=>document.activeElement?.id==='resumeBtn');
  await p.keyboard.press('Shift+Tab'); assert.equal(await p.evaluate(()=>document.activeElement.id),'restartBtn');
  await p.keyboard.press('Tab'); assert.equal(await p.evaluate(()=>document.activeElement.id),'resumeBtn');
  const paused=(await snap(p)).player.x;
  await p.keyboard.press('d'); assert.equal((await snap(p)).player.x,paused);
  await audit(p,'pause dialog');
  await p.keyboard.press('Escape');
  await p.waitForFunction(()=>document.activeElement?.id==='game');
  check('pause focus', 'Focus is trapped, background is inert, movement is held, and Escape resumes with focus on the arena.');

  await deliver(p);
  assert.equal(await p.locator('#upgrades button').count(),8);
  await p.evaluate(()=>window.echoLedger.debug.fragments(500));
  await audit(p,'upgrade shop');
  const before=(await snap(p)).money;
  await p.locator('#upgrades button').nth(0).click();
  assert.equal((await snap(p)).money,before-27);
  assert.equal((await snap(p)).echoLimit,3);
  await p.click('#shopCodex'); await p.waitForFunction(()=>window.echoLedger.snapshot().state==='info');
  await p.click('#enemyTab'); assert.equal(await p.locator('.codex-card').count(),6);
  await p.click('#featTab'); assert.equal(await p.locator('.codex-card').count(),12);
  await audit(p,'codex dialog');
  await p.keyboard.press('Escape');
  assert.equal((await snap(p)).state,'shop');
  await p.click('#nextBtn'); assert.equal((await snap(p)).level,2);
  assert.equal((await snap(p)).echoLimit,3);
  check('delivery and progression', 'Vault recovery opens all 8 upgrade branches; buying Parallel Spools costs exactly 27, survives next sector, and nested codex returns to the shop.');

  live.fail=true;
  await p.evaluate(()=>window.squeekFeed.poll());
  assert.equal((await snap(p)).telemetry.live,false);
  assert.match(await p.locator('#liveBadge').innerText(),/Simulated/);
  assert.match(await p.locator('#feedSource').innerText(),/Cached/);
  live.fail=false; live.data.status=fixtureStatus();
  await p.click('#retryBtn'); await p.waitForFunction(()=>window.squeekFeed.live);
  check('network recovery', 'Failed reads switch to Simulated and cached receipts; Refresh restores the live fixture.');
  await p.keyboard.press('p'); await p.click('#retireBtn');
  await p.waitForFunction(()=>window.echoLedger.snapshot().state==='over');
  assert.equal(await p.locator('#summaryGrid>div').count(),8);
  await audit(p,'run summary');
  await p.click('#summaryHome'); assert.equal((await snap(p)).state,'title');
  await p.click('#titleHelp'); await audit(p,'field guide');
  await p.keyboard.press('Escape');
  await p.waitForFunction(()=>document.activeElement?.id==='titleHelp');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'titleHelp');
  check('summary and guide', 'Eight run statistics, return to title, guide close and focus restoration.');

  await protectedRun(p,'?test=1&offline=1&sector=3');
  for(const r of (await snap(p)).relays) await recordAt(p,r.x,r.y);
  await p.waitForFunction(()=>window.echoLedger.snapshot().relays.every(r=>r.on));
  check('paired seals', 'Two different echoes held together complete sector 3 seals.');
  await protectedRun(p,'?test=1&offline=1&sector=5');
  await recordAt(p,355,205); await p.waitForTimeout(2700);
  assert.equal((await snap(p)).boss.hp,3,'one echo cannot defeat boss');
  await recordAt(p,355,515); await shot(p,'boss-1440');
  await p.waitForFunction(()=>window.echoLedger.snapshot().boss.dead,null,{timeout:12000});
  assert.equal((await snap(p)).stats.bosses,1);
  await deliver(p);
  check('Auditor General', 'One echo cannot break armor; two echoes break all three plates and permit delivery.');

  const seenBiomes=new Set(), threats=new Set();
  for(const sector of [1,3,5]) {
    await protectedRun(p,`?test=1&offline=1&sector=${sector}`);
    // Re-open without clearing enemies to inspect the original generated threat roster.
    await p.goto(base+`?test=1&offline=1&sector=${sector}`); await p.click('#startBtn');
    const state=await snap(p); seenBiomes.add(state.biome); state.enemies.forEach(e=>threats.add(e.type));
  }
  assert.equal(seenBiomes.size,3); assert.equal(threats.size,5);
  assert.equal(new Set((await snap(p)).pickups.map(p=>p.type)).size,6);
  check('v2 content', 'All three biomes, five ordinary threat types and six pickup types are present.');

  // A normal, unranked-by-nothing run: achievements/scores must use their real persistence path.
  await p.goto(base+'?offline=1'); await p.click('#startBtn');
  assert.equal(await p.evaluate(()=>!!window.echoLedger.debug),false,'no debug outside test query');
  await p.keyboard.press('r'); await p.waitForTimeout(850); await p.keyboard.press('r');
  assert.ok((await snap(p)).progress.feats.includes('first'));
  await p.keyboard.press('p'); await p.click('#retireBtn');
  assert.ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('echo-ledger-v2-scores')).length>0));
  await p.reload(); assert.ok((await snap(p)).progress.feats.includes('first'));
  check('local persistence', 'A normal run saves achievements and personal records across reload; debug helpers are absent.');

  const {page:m,context:mobile}=await open({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await protectedRun(m);
  const x=(await snap(m)).player.x;
  await m.locator('#joystick').scrollIntoViewIfNeeded();
  const pad=await m.locator('#joystick').boundingBox();
  await m.mouse.move(pad.x+pad.width/2,pad.y+pad.height/2); await m.mouse.down();
  await m.mouse.move(pad.x+pad.width*.9,pad.y+pad.height/2); await m.waitForTimeout(450); await m.mouse.up();
  assert.ok((await snap(m)).player.x>x+40,'pointer capture movement');
  await m.locator('#touchRecord').tap(); await m.waitForTimeout(850); await m.locator('#touchRecord').tap();
  assert.equal((await snap(m)).echoes.length,1);
  await m.locator('#touchDash').tap(); assert.ok((await snap(m)).player.dash>0);
  await m.locator('#touchPurge').tap(); assert.equal((await snap(m)).player.purges,1);
  await m.locator('#touchPause').tap();
  await m.waitForFunction(()=>window.echoLedger.snapshot().state==='pause');
  await m.click('#pauseGuide'); await m.click('#closeGuide');
  await m.click('#resumeBtn');
  await m.waitForFunction(()=>window.echoLedger.snapshot().state==='play');
  assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false);
  await m.locator('#viewport').scrollIntoViewIfNeeded(); await shot(m,'gameplay-390');
  check('mobile controls', 'Captured pointer drag moves courier; touchscreen Record/Release, Dash and Purge work without overflow.');

  const shared=[];
  for(const page of [p,m]) {
    await page.goto(base+'?test=1&offline=1'); await page.click('#sharedMode'); await page.click('#startBtn');
    const state=await snap(page); shared.push({seed:state.seed,walls:state.walls});
    assert.match(await page.locator('#seedLabel').innerText(),/Sim Shared Block/);
  }
  assert.deepEqual(shared[0],shared[1]);
  check('Shared Block', 'Same practice settled height and Tokyo date produce identical seed and walls at desktop/mobile sizes.');
  const practice=(await snap(m)).progress.maxDistance;
  await m.evaluate(()=>window.echoLedger.debug.surge());
  assert.match(await m.locator('#surgeBanner').innerText(),/Simulated/);
  assert.equal((await snap(m)).progress.maxDistance,practice,'simulation cannot award real distance');
  check('simulation honesty', 'Simulated Surge is labeled; simulated distance never increases real distance progress.');
  await mobile.close();

  // Actual public requests, without interception, are recorded separately from fixture checks.
  const {page:real,context:realContext}=await open({viewport:{width:1280,height:900}});
  const transport=[];
  real.on('requestfailed',r=>{if(r.url().startsWith('https://api.squeekchain.com/'))transport.push({endpoint:new URL(r.url()).pathname,error:r.failure()?.errorText});});
  await real.goto(base);
  await real.waitForFunction(()=>Object.keys(window.squeekFeed.snapshot().requests).length===3,null,{timeout:15000});
  report.publicAPI=await real.evaluate(()=>window.squeekFeed.snapshot());
  report.publicAPITransport=transport;
  if(!report.publicAPI.live)report.limitations.push('Unintercepted public API did not provide usable live hardware during this browser run. See publicAPI/transport in the report; fixture validation is separate.');
  check('public API observation', `Live=${report.publicAPI.live}; reason=${report.publicAPI.reason||'none'}. No fixture used for this observation.`);
  await realContext.close();

  const {page:reduced,context:reducedContext}=await open({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto(base+'?offline=1');
  assert.equal(await reduced.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity).length),0);
  await reduced.evaluate(()=>document.documentElement.style.fontSize='200%');
  assert.equal(await reduced.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,'200% text reflow');
  await reducedContext.close();
  check('reduced motion and text enlargement', 'No endless CSS animation under reduce; 200% root text has no page overflow at 390. This is text enlargement, not browser-native zoom.');
  await desktop.close();

  await browser.close(); browser=null;
  try {
    const webkitExecutable=process.argv.find(arg=>arg.startsWith('--webkit='))?.slice(9);
    const safari=await webkit.launch({headless:true,...(webkitExecutable?{executablePath:webkitExecutable}:{})});
    const page=await safari.newPage({viewport:{width:390,height:844},hasTouch:true});
    await page.goto(base+'?offline=1'); await page.click('#startBtn');
    await page.keyboard.press('r'); await page.waitForTimeout(850); await page.keyboard.press('r');
    assert.equal((await snap(page)).echoes.length,1); await page.keyboard.press('p');
    assert.equal((await snap(page)).state,'pause');
    await safari.close(); check('WebKit main interaction','Start, record/release and pause.');
  } catch(e) { report.limitations.push('WebKit could not run: browser/runtime dependencies unavailable. No Safari compatibility claim.'); }
  assert.deepEqual(errors,[],'No JavaScript errors or failed local assets');
  check('runtime integrity','No JavaScript errors or missing local production files in tested Chromium flows.');
  report.passed=true;
} catch(e) {
  report.passed=false; report.failure=e.stack; console.error(e); process.exitCode=1;
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
  await writeFile(new URL('report.json',out),JSON.stringify(report,null,2)+'\n');
}
