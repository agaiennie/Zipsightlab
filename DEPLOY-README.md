# Deploy Zipsight Lab with live Census data

This version pulls demographics **live on every report** using a small server-side
function (`netlify/functions/census.js`). Because functions can't go live by
drag-and-drop, you deploy this once from GitHub. ~10 minutes, no coding.

## What's in this folder
- `index.html` — the site (report generator)
- `example-17322.html` — the live example page
- `how-to-read-your-report.html` — the guide
- `netlify.toml` — tells Netlify where the function is
- `netlify/functions/census.js` — the Census proxy (runs on Netlify's server)

## Steps

### 1) Put these files in a GitHub repo
1. Go to **github.com** and sign in (free account is fine).
2. Click **New repository** → name it `zipsightlab-site` → **Create repository**.
3. On the empty repo page, click **“uploading an existing file.”**
4. **Drag the entire contents of this folder in**, including the `netlify` folder.
   Keep the folder structure — `netlify/functions/census.js` must stay in its subfolder.
5. Click **Commit changes**.

### 2) Connect it to Netlify
1. In Netlify: **Add new site → Import an existing project → Deploy with GitHub.**
2. Authorize GitHub and pick your `zipsightlab-site` repo.
3. Leave **build command empty** and **publish directory** as `.` (the `netlify.toml`
   already sets this). Click **Deploy**.
4. Netlify publishes the site **and** the function. Live Census now works.

### 3) Keep your URL / QR code
Your QR points at `zipsightlab.netlify.app`. To reuse that name on the new site:
- First delete (or rename) the old drag-and-drop site so the name frees up, then
  in the new site: **Site settings → Change site name → `zipsightlab`.**
- Or just point your domain **zipsightlab.com** at this new site (Domain management →
  Add custom domain), and use that on your materials.

### 4) (Recommended) Add a free Census key for higher volume
1. Get a free key: https://api.census.gov/data/key_signup.html
2. In Netlify: **Site settings → Environment variables → Add** `CENSUS_API_KEY` = your key.
3. Trigger a redeploy. (Optional — it works without a key at low volume.)

## Test it
Open your live site → start any report → type a ZIP (e.g. `17322`). Households and
median income should fill in automatically. If they don't, open
`https://YOUR-SITE.netlify.app/.netlify/functions/census?zip=17322` in your browser —
you should see JSON. If you see an error there, the function didn't deploy (check that
`netlify/functions/census.js` kept its folder path in the repo).

*Note: opening index.html on your own computer (file://) will still ask for manual
entry — the live lookup only works once it's deployed on Netlify with the function.*
