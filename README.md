# SCO Forecasting Tool

React + Vite + TypeScript single-page app for modeling SCO install revenue. Built to run fully client-side (GitHub Pages ready) with a forecasting engine that matches the provided pricing rules and example calculation.

## Features
- Client selection cards for Publix, WinCo, Meijer, and ADUSA.
- Dynamic install entry: set number of events, add/remove rows, date/quantity/unit type (Full Function or Narrow Core).
- Forecast to any end date with month-accurate day counts (leap years included).
- Monthly revenue breakdown and per-install accordion details.
- Exports to CSV or JSON.
- Hash-based routing for GitHub Pages compatibility.

## Development 
```bash
npm install
npm run dev
```

## Build (GitHub Pages ready)
```bash
npm run build
npm run preview   # optional local check
```

## Deployment to GitHub Pages

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `forecasting` (or any name you prefer)
3. **Don't** initialize with README, .gitignore, or license (we already have these)

### Step 2: Update Base Path (if needed)
If your repository name is NOT `forecasting`, update `vite.config.ts`:
```typescript
base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
```

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/forecasting.git
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy on every push to `main`

### Step 5: Access Your App
After the workflow completes (check the **Actions** tab), your app will be available at:
- `https://YOUR_USERNAME.github.io/forecasting/`

The deployment happens automatically whenever you push changes to the `main` branch!

## Architecture
- `src/lib/pricing.ts` — pricing constants and rate helpers.
- `src/lib/dateUtils.ts` — month/day helpers with leap-year support.
- `src/lib/forecastEngine.ts` — per-install monthly breakdown + merge logic.
- `src/components/*` — UI pieces (client selection, install form, tables).
- `src/App.tsx` — routes; `src/main.tsx` uses `HashRouter` for static hosting.

## Validation example
Install date Jan 10, quantity 2 FF + 3 NC, forecast end Jan 31 → days active 21  
FF: 2 × 21 × 3.034472, NC: 3 × 21 × 1.090028, total ≈ **280.17** (matches spec).
