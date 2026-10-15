# osdash

Outlet performance dashboard: weekly sales against target, by outlet.

It is a single static page (`index.html`) with no build step. On load, the page
reads the "Combined" tab of a Google Sheet and draws the charts in the browser.

## Deploy to Vercel

1. Go to https://vercel.com/new and import this GitHub repository.
2. Framework Preset: **Other**. Leave Build Command and Output Directory empty.
3. Click **Deploy**.

Every push to `main` redeploys automatically.

## Data source

The sheet link, tab name and the 90% threshold are set in the `CONFIG` block near
the bottom of `index.html`. The sheet must be shared as "Anyone with the link can
view", and the tab needs these columns: `outlet`, `week`, `sales`, `target`,
`orders`, `returns`.
