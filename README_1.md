# osdash

Outlet performance dashboard: weekly sales against target, by outlet.

It is a single static page (`index.html`) with no build step. On load, the page
reads the "Combined" tab of a Google Sheet and draws the charts in the browser.
Access is protected by HTTP Basic Auth using Vercel Routing Middleware
(`middleware.js`).

## Deploy to Vercel

1. Go to https://vercel.com/new and import this GitHub repository.
2. Framework Preset: **Other**. Leave Build Command and Output Directory empty.
3. Before deploying, open **Environment Variables** and add (for Production,
   Preview and Development):
   - `BASIC_AUTH_USER`: the username
   - `BASIC_AUTH_PASSWORD`: a long, unique password
4. Click **Deploy**.

If you add or change the variables after a deploy, redeploy for them to apply.
If the variables are missing, the site returns a 503 error instead of opening
to everyone.

## Test locally (optional)

```bash
npm i -g vercel
npm install
BASIC_AUTH_USER=demo BASIC_AUTH_PASSWORD=change-me vercel dev
```

## Data source

The sheet link, tab name and the 90% threshold are set in the `CONFIG` block near
the bottom of `index.html`. The sheet must be shared as "Anyone with the link can
view", and the tab needs these columns: `outlet`, `week`, `sales`, `target`,
`orders`, `returns`.

Note: Basic Auth protects the dashboard page. The browser still fetches the data
directly from Google Sheets, so anyone who has the sheet link can read the sheet
itself.
