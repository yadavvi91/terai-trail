# E2E Visual Tests (Playwright)

Scaffolding for Playwright visual regression tests. These tests will be
implemented in WP19 once all scenes are built.

## Planned Tests

1. **Title scene loads** — no console errors, title text visible
2. **Party creation flow** — can enter names, select district
3. **Supply depot** — can buy/sell items
4. **Settlement scene** — ground tiles render, HUD visible
5. **Foraging mini-game** — scene transitions work
6. **Monsoon crossing** — scene loads, choices appear
7. **Milestone celebration** — triggers at correct acre thresholds
8. **Game over** — death and victory screens render
9. **Full playthrough** — title → creation → depot → settlement → victory

## Running

```bash
# Once implemented:
npx playwright test tests/e2e/
```

## Screenshot Baselines

Baselines will be stored in `tests/e2e/__screenshots__/` after first run.
