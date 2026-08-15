// OBubba — server-authoritative subscriptions codebase (isolated so it deploys
// without loading the 39-function default codebase). See SERVER_AUTH_SUBSCRIPTIONS.md.
const { initializeApp } = require("firebase-admin/app");
initializeApp();
Object.assign(exports, require("./appstore_notifications"));
Object.assign(exports, require("./play_notifications"));
