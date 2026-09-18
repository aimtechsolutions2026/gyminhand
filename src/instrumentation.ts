export async function register() {
  // Only execute in Node.js server runtime (not Edge or client)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startKeepAlive } = await import("@/lib/keep-alive");
    startKeepAlive();
  }
}
