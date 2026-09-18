/**
 * Background Keep-Alive Service for Render Web Service
 * Automatically sends an external HTTP ping to /api/health every 10 minutes
 * to prevent Render Free Tier from spinning down due to the 15-minute inactivity timeout.
 */

let isRunning = false;

export function startKeepAlive() {
  if (isRunning) return;
  isRunning = true;

  // Only run in production
  if (process.env.NODE_ENV !== "production") {
    console.log("[Keep-Alive] Development environment detected. Auto-ping disabled.");
    return;
  }

  // Determine target URL (Render automatically provides RENDER_EXTERNAL_URL)
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.RENDER_EXTERNAL_URL
      ? process.env.RENDER_EXTERNAL_URL.startsWith("http")
        ? process.env.RENDER_EXTERNAL_URL
        : `https://${process.env.RENDER_EXTERNAL_URL}`
      : null);

  if (!baseUrl) {
    console.warn("[Keep-Alive] No NEXTAUTH_URL or RENDER_EXTERNAL_URL found. Auto-ping skipped.");
    return;
  }

  const pingUrl = `${baseUrl.replace(/\/$/, "")}/api/health`;
  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  console.log(`[Keep-Alive] Service started. Pinging ${pingUrl} every 10 minutes.`);

  // Initial delayed ping after 1 minute
  setTimeout(() => {
    pingHealth(pingUrl);
  }, 60 * 1000);

  // Recurring 10-minute cron interval
  setInterval(() => {
    pingHealth(pingUrl);
  }, PING_INTERVAL_MS);
}

async function pingHealth(url: string) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "FitFlow-Render-KeepAlive/1.0",
      },
      cache: "no-store",
    });

    if (res.ok) {
      console.log(`[Keep-Alive] Successfully pinged ${url} - Status: ${res.status}`);
    } else {
      console.warn(`[Keep-Alive] Ping received non-200 response: ${res.status}`);
    }
  } catch (error) {
    console.error(
      `[Keep-Alive] Failed to ping ${url}:`,
      error instanceof Error ? error.message : error
    );
  }
}

