const WHOOP_ORIGIN = "https://api.prod.whoop.com";

export const whoopConfig = {
  authorizationUrl: `${WHOOP_ORIGIN}/oauth/oauth2/auth`,
  tokenUrl: `${WHOOP_ORIGIN}/oauth/oauth2/token`,
  apiUrl: `${WHOOP_ORIGIN}/developer/v2`,
  clientId: process.env.WHOOP_CLIENT_ID,
  clientSecret: process.env.WHOOP_CLIENT_SECRET,
  redirectUri: process.env.WHOOP_REDIRECT_URI,
  encryptionKey: process.env.WHOOP_ENCRYPTION_KEY,
  adminSecret: process.env.WHOOP_ADMIN_SECRET,
  jobSecret: process.env.WHOOP_JOB_SECRET ?? process.env.CRON_SECRET,
};

export const OWNER_SCOPES = ["read:recovery", "read:sleep", "read:cycles", "offline"] as const;

export function assertWhoopOAuthConfig() {
  const missing = Object.entries({
    WHOOP_CLIENT_ID: whoopConfig.clientId,
    WHOOP_CLIENT_SECRET: whoopConfig.clientSecret,
    WHOOP_REDIRECT_URI: whoopConfig.redirectUri,
    WHOOP_ENCRYPTION_KEY: whoopConfig.encryptionKey,
  }).filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`Missing WHOOP configuration: ${missing.join(", ")}`);
}
