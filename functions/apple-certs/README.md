# Apple root CA certs (required by subscription_webhooks.js → appStoreNotifyV2)

The App Store Server Notifications V2 verifier needs Apple's root CA certificates to
validate the JWS `x5c` chain on every notification. Download the DER `.cer` files
from Apple's PKI page and drop them in THIS directory (they are public certs, safe to
commit):

  https://www.apple.com/certificateauthority/

Needed (at minimum the current root used by App Store receipts):
  - AppleRootCA-G3.cer     (Apple Root CA - G3 Root)
  - AppleRootCA-G2.cer     (optional, older chains)
  - AppleComputerRootCertificate.cer / AppleIncRootCertificate.cer (optional)

`appleVerifier()` reads every `*.cer` in this folder as a root. After adding them:
  1) cd functions && npm i            # installs @apple/app-store-server-library
  2) set env: APPLE_BUNDLE_ID (the app the subs were sold under), APPLE_APP_APPLE_ID=6760968757,
     APPLE_STORE_ENV=sandbox (for testing) then production
  3) register the function URL in ASC → App Information → App Store Server Notifications V2
  4) send a test notification from ASC and confirm a doc lands in `subscription_events`
BEFORE pointing production at it.
