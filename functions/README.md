# OBubba Cloud Functions — reconciled source of truth

Reconciled **2026-08-08**. Before this, no copy of the source contained all the
live functions, and production was only intact because every deploy had been done
with `--only`.

## The three codebases

Firebase labels each function with its codebase (`firebase-functions-codebase`);
these directories match what is actually deployed.

| dir | codebase | functions |
|---|---|---|
| `functions/` | `default` | 32 live (accounts, reminders, referrals, pushes, …) |
| `functions-subs/` | `subs` | `appStoreServerNotificationsV2`, `playRtdn`, `linkPurchaseToken` |
| `functions-clock/` | `clock` | `clockOnlineParentCount` |

All 36 live functions are accounted for. Verified with `firebase deploy --dry-run`:
every codebase loads and analyses successfully.

## How this was rebuilt

The working copy (`~/Desktop/simplify dev`) is iCloud-stalled and hangs on read, so
the source was recovered from the GCS build bundles that Cloud Functions keeps for
each deploy:

```sh
gcloud functions describe <fn> --project obubba-d9ccc --region us-central1 \
  --format="value(buildConfig.source.storageSource.generation)"
gcloud storage cp "gs://gcf-v2-sources-1091432133381-us-central1/<fn>/function-source.zip#<gen>" .
```

Each zip is snapshotted at **that function's own deploy time**, so the bundles
differ. Four snapshots of the `default` codebase exist, and they had forked:

| snapshot | lines | notes |
|---|---|---|
| 9 Jun | 1252 | has `cleanupBubbaHugs` |
| 15 Jun | 1502 | **byte-identical to what this repo held until today** — the only copy of the provider identity sign-in helpers |
| 3 Jul | 1827 | the only copy of `qualifyReferrals` |
| 13 Jul | 2753 | newest; adds camera ingest — but had **dropped** `qualifyReferrals`, `providerAccountSignIn` and `cleanupBubbaHugs` |

`functions/index.js` is the 13 Jul snapshot as its base, with the live functions
later snapshots had dropped re-added from the bundle that deployed each one,
together with the helpers they need (`PROVIDER_JWKS`, `providerName`,
`claimString`, `verifyProviderIdentityToken` — which exist in no other source line).
Those blocks are marked with a `RECONCILED 2026-08-08` banner near the bottom.

`qualifyReferrals` is the version deployed on 2026-08-08, including the
anon-redeemer, self-referral and code-swap fixes. See
`obubba_flutter_main/tools/functions_fixes/README.md`.

## ⚠️ Before you run a full deploy

A bare `firebase deploy --only functions` from this repo is **still not safe yet**,
for two reasons that predate the reconciliation:

1. **It would CREATE 9 functions that are not currently live**, because they exist
   in the 13 Jul source but were never deployed: `cameraIngest`, `cameraPair`,
   `createCameraPairing`, `revokeCameraDevice`, `cleanupClockPresence`,
   `getClockOnlineParentCount`, `mirrorStoreEntitlement`, `validateAppleReceipt`,
   `weeklyEmailDigest`. Decide whether each should ship or be removed from source.
   (`getClockOnlineParentCount` looks like a rename of the live
   `clockOnlineParentCount`, which lives in the `clock` codebase — reconcile those
   two before deploying either.)

2. **`validateAppleReceipt` requires a secret that does not exist.** It declares
   `secrets: ["APPLE_SHARED_SECRET"]`, and Secret Manager has no such secret, so
   deploy validation fails before anything is uploaded. This is why that function
   was never live. Either create the secret or drop the function.

`firebase.json` here also declares `firestore.rules` and `hosting`. The Firestore
rules are SHARED and deployed — do not deploy them from here casually.

**Until those are resolved, keep deploying one function at a time:**

```sh
firebase deploy --only functions:qualifyReferrals --project obubba-d9ccc
```

That is what shipped the 8 Aug referral fix, and it was verified afterwards to have
left all 36 live functions untouched. Run `npm install` in the codebase directory
first — the CLI needs `firebase-functions` present locally to analyse the source.
