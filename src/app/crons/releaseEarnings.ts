/* eslint-disable no-console */
/**
 * Earnings Release Cron
 * ---------------------
 * Runs daily at 00:05 AM server time.
 * Moves PENDING VendorEarnings whose holding period (7 days) has expired
 * to AVAILABLE so vendors can withdraw them.
 *
 * Install node-cron if not already installed:
 *   npm install node-cron
 *   npm install --save-dev @types/node-cron
 */
import cron from "node-cron";
import { VendorEarningService } from "../modules/vendor-earning/vendor-earning.service";

export const startEarningsCron = (): void => {
  // Runs every day at 00:05
  cron.schedule("5 0 * * *", async () => {
    console.log("[Cron] Running earnings release job…");
    try {
      const { released } = await VendorEarningService.releaseAvailableEarnings();
      console.log(`[Cron] Earnings release complete — ${released} earning(s) moved to AVAILABLE`);
    } catch (err) {
      console.error("[Cron] Earnings release failed:", err);
    }
  });

  console.log("[Cron] Earnings release cron scheduled (daily at 00:05)");
};
