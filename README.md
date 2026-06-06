# CAPCOM Dashboard — deploy to Vercel

Mission-control view of the bilateral handshake. The browser never sees the
tokens — two Edge functions proxy to the engines with server-side env vars.

## Structure
```
capcom-dashboard/
├── api/
│   ├── pending.js     GET-ish: reads BOTH engines' /capcom/pending
│   └── action.js      POST: propose / approve / register, routed by side
├── public/
│   └── index.html     the dashboard UI
└── vercel.json
```

## Deploy

1. Put this folder in its own git repo (separate from houston), OR a subfolder
   you point Vercel at. Simplest: new repo `capcom-dashboard`.
   ```powershell
   cd C:\Users\felip\capcom-dashboard
   git init
   git add -A
   git commit -m "CAPCOM dashboard"
   # create the repo on GitHub, then:
   git remote add origin https://github.com/pipeceballos17-sketch/capcom-dashboard.git
   git push -u origin main
   ```

2. In Vercel: New Project → import `capcom-dashboard`. Framework preset: Other.
   Output dir: leave default (serves /public).

3. Vercel → Settings → Environment Variables, add four (NO quotes around values):
   ```
   A_URL    = https://houston-production-cbc9.up.railway.app
   A_TOKEN  = <your token A>
   B_URL    = https://diligent-encouragement-production-ae06.up.railway.app
   B_TOKEN  = <your token B>
   ```

4. Deploy. Open the URL.

## Demo flow (for judges)

1. Click "A → propose lead to B". A's OUTBOUND gate appears (left panel).
2. Click approve on A's gate. ~1s later B's INBOUND gate appears (right panel)
   showing the peer as "Outbound Agent".
3. Click approve on B's gate. Deal READY — both panels clear. The log at the
   bottom shows the full bilateral trail with timestamps.
4. Reject path: click reject on either gate → that gate clears, deal dies.

## Note — one-time peer registration

The engines need to know about each other (peer + self_id) once. Run the
register steps from `capcom-e2e-test-v2.ps1` once after each redeploy, OR add
a "register peers" button calling /api/action with op:"register". For the demo
it's cleanest to pre-register via the script, then drive the gates from the UI.
