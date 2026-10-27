/**
 * SafeHer Multi-Tier SMS Service
 * 
 * TIER 1: Developer's Own Mobile Number (100 SMS/day daily recharge pack)
 * TIER 2: Backup Cloud SMS Gateway (Fast2SMS) if Dev's 100 SMS quota is exhausted
 * TIER 3: Double Fallback Warning: If both Dev & Gateway recharge are exhausted,
 *         alerts clearly that "Dono ka hi recharge nahi hai!" and prompts helpline 112.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { exec } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const QUOTA_FILE = path.join(__dirname, "../data/dev_sms_quota.json");

class SMSService {
  constructor() {
    this.ensureQuotaFile();
  }

  ensureQuotaFile() {
    try {
      const dir = path.dirname(QUOTA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(QUOTA_FILE)) {
        const today = this.getTodayDateString();
        fs.writeFileSync(
          QUOTA_FILE,
          JSON.stringify(
            {
              date: today,
              dailyLimit: 100,
              sentToday: 0,
              devPhone: process.env.DEV_PHONE_NUMBER || "",
            },
            null,
            2
          )
        );
      }
    } catch (e) {
      console.error("Error initializing SMS quota file:", e);
    }
  }

  getTodayDateString() {
    const d = new Date();
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  getDevQuota() {
    try {
      this.ensureQuotaFile();
      const content = fs.readFileSync(QUOTA_FILE, "utf8");
      const data = JSON.parse(content);
      const today = this.getTodayDateString();

      // Reset count if it's a new calendar day
      if (data.date !== today) {
        data.date = today;
        data.sentToday = 0;
        fs.writeFileSync(QUOTA_FILE, JSON.stringify(data, null, 2));
      }

      const limit = parseInt(process.env.DEV_DAILY_SMS_LIMIT || data.dailyLimit || 100, 10);
      data.dailyLimit = limit;
      data.remaining = Math.max(0, limit - (data.sentToday || 0));
      return data;
    } catch (e) {
      console.error("Error reading dev quota:", e);
      return { date: this.getTodayDateString(), dailyLimit: 100, sentToday: 0, remaining: 100 };
    }
  }

  incrementDevQuota(count = 1) {
    try {
      const quota = this.getDevQuota();
      quota.sentToday = (quota.sentToday || 0) + count;
      fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2));
      return quota;
    } catch (e) {
      console.error("Error incrementing dev quota:", e);
    }
  }

  /**
   * Helper to manually set quota (for testing recharge exhaustion)
   */
  setDevSentToday(sentCount) {
    try {
      const quota = this.getDevQuota();
      quota.sentToday = sentCount;
      fs.writeFileSync(QUOTA_FILE, JSON.stringify(quota, null, 2));
      return quota;
    } catch (e) {
      console.error("Error setting dev quota:", e);
    }
  }

  /**
   * TIER 1: Send via Dev's Phone (100 SMS/day Pack)
   */
  async sendViaDevPhone(recipientNumbers, messageText) {
    const quota = this.getDevQuota();
    if (quota.remaining <= 0) {
      return {
        success: false,
        exhausted: true,
        reason: `Dev ke number ka 100 SMS/day recharge limit poora ho chuka hai (${quota.sentToday}/${quota.dailyLimit} sent today).`,
      };
    }

    const gatewayUrl = (process.env.DEV_PHONE_GATEWAY_URL || "").trim();

    // A server cannot send through a phone SIM without a configured bridge.
    if (gatewayUrl) {
      try {
        const payload = JSON.stringify({
          to: recipientNumbers,
          message: messageText,
        });

        const url = new URL(gatewayUrl);
        const reqModule = url.protocol === "https:" ? https : http;

        const res = await new Promise((resolve, reject) => {
          const req = reqModule.request(
            gatewayUrl,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              },
              timeout: 6000,
            },
            (response) => {
              let body = "";
              response.on("data", (chunk) => (body += chunk));
              response.on("end", () => resolve({ status: response.statusCode, body }));
            }
          );
          req.on("error", reject);
          req.on("timeout", () => {
            req.destroy();
            reject(new Error("Dev phone bridge timeout"));
          });
          req.write(payload);
          req.end();
        });

        if (res.status >= 200 && res.status < 300) {
          this.incrementDevQuota(recipientNumbers.length);
          const updatedQuota = this.getDevQuota();
          console.log(`📱 [Dev SIM SMS] Accepted by Dev Phone Gateway (Quota remaining: ${updatedQuota.remaining}/${updatedQuota.dailyLimit})`);
          return { success: true, channel: "Dev Phone (SIM Gateway)", quotaRemaining: updatedQuota.remaining };
        }

        return {
          success: false,
          reason: `Dev phone gateway returned HTTP ${res.status}.`,
        };
      } catch (err) {
        console.warn(`⚠️ Dev Phone Gateway request failed: ${err.message}`);
        return {
          success: false,
          reason: `Dev phone gateway request failed: ${err.message}`,
        };
      }
    }

    return {
      success: false,
      reason:
        "DEV_PHONE_GATEWAY_URL is not configured; this server cannot send SMS through a phone SIM without a phone gateway.",
    };
  }

  /**
   * TIER 2: Send via Cloud SMS Gateway (Fast2SMS)
   */
  async sendViaFast2SMS(recipientNumbers, messageText) {
    const apiKey = (process.env.FAST2SMS_API_KEY || "").trim();

    if (!apiKey) {
      return {
        success: false,
        exhausted: true,
        reason: "Fast2SMS API Key configure nahi hai (FAST2SMS_API_KEY is empty).",
      };
    }

    // Clean Indian 10-digit phone numbers
    const cleanNumbers = recipientNumbers
      .map((num) => String(num).replace(/[^0-9]/g, "").slice(-10))
      .filter((num) => num.length === 10);

    if (cleanNumbers.length === 0) {
      return { success: false, reason: "Koi valid 10-digit phone number nahi mila." };
    }

    try {
      const payload = JSON.stringify({
        route: "q",
        message: messageText,
        language: "english",
        flash: 0,
        numbers: cleanNumbers.join(","),
      });

      const result = await new Promise((resolve, reject) => {
        const req = https.request(
          "https://www.fast2sms.com/dev/bulkV2",
          {
            method: "POST",
            headers: {
              authorization: apiKey,
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            },
            timeout: 10000,
          },
          (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                resolve(JSON.parse(data));
              } catch {
                resolve({ return: false, message: data });
              }
            });
          }
        );
        req.on("error", reject);
        req.on("timeout", () => {
          req.destroy();
          reject(new Error("Fast2SMS request timed out."));
        });
        req.write(payload);
        req.end();
      });

      if (result.return === true) {
        console.log(`🌐 [Tier 2: Fast2SMS] SMS sent successfully to: ${cleanNumbers.join(", ")}`);
        return { success: true, channel: "Fast2SMS Gateway", data: result };
      } else {
        console.warn(`⚠️ [Fast2SMS Error / Low Balance]:`, result.message);
        return {
          success: false,
          exhausted: true,
          reason: result.message || "Fast2SMS balance exhausted or API rejected.",
        };
      }
    } catch (err) {
      console.error(`❌ [Fast2SMS Request Failed]:`, err.message);
      return {
        success: false,
        exhausted: true,
        reason: `Fast2SMS network failure: ${err.message}`,
      };
    }
  }

  /**
   * Main Dispatcher: Cascade Tier 1 -> Tier 2 -> Tier 3
   */
  async dispatchSMS({ numbers, messageText }) {
    const recipientList = (Array.isArray(numbers) ? numbers : [numbers])
      .map((n) => String(n || "").trim())
      .filter((n) => n.length >= 10);

    if (recipientList.length === 0) {
      return {
        success: false,
        message: "No valid recipient phone numbers provided.",
      };
    }

    let devExhausted = false;
    let devReason = "";

    // -------------------------------------------------------------
    // STEP 1: Try Tier 1 (Developer's Phone 100 SMS Pack)
    // -------------------------------------------------------------
    const devQuota = this.getDevQuota();
    if (devQuota.remaining > 0) {
      const devRes = await this.sendViaDevPhone(recipientList, messageText);
      if (devRes.success) {
        return {
          success: true,
          channel: "Dev Phone (SIM Pack)",
          message: `SMS sent via Dev's SIM (100 SMS/day pack). Remaining: ${devRes.quotaRemaining}/${devQuota.dailyLimit}`,
          devExhausted: false,
          gatewayExhausted: false,
        };
      } else {
        devExhausted = true;
        devReason = devRes.reason || "Dev phone unavailable.";
      }
    } else {
      devExhausted = true;
      devReason = `Dev ke number ka 100 SMS/day recharge limit poora ho chuka hai (${devQuota.sentToday}/${devQuota.dailyLimit}).`;
    }

    console.warn(`\n⚠️ [Tier 1 Exhausted] ${devReason}`);
    console.log(`➡️ [Switching to Tier 2] Fast2SMS backup gateway try kar rahe hain...`);

    // -------------------------------------------------------------
    // STEP 2: Try Tier 2 (Backup SMS Gateway - Fast2SMS)
    // -------------------------------------------------------------
    const gatewayRes = await this.sendViaFast2SMS(recipientList, messageText);
    if (gatewayRes.success) {
      return {
        success: true,
        channel: "Fast2SMS Backup Gateway",
        message: `Dev ka 100 SMS recharge khatam tha, isiliye SMS Fast2SMS Gateway ke zariye bhej diya gaya!`,
        devExhausted: true,
        gatewayExhausted: false,
      };
    }

    // -------------------------------------------------------------
    // STEP 3: TIER 3 - BOTH EXHAUSTED!
    // -------------------------------------------------------------
    const smsFailureMessage =
      "SMS could not be delivered through the phone gateway or Fast2SMS. Please call emergency helpline 112 directly.";

    console.log("\n==================================================================");
    console.log("❌ [SMS DELIVERY FAILED]");
    console.log(smsFailureMessage);
    console.log(`1. Dev Phone Gateway: ${devReason}`);
    console.log(`2. Fast2SMS: ${gatewayRes.reason || "Provider did not accept the request."}`);
    console.log(`🎯 Targeted Recipients: ${recipientList.join(", ")}`);
    console.log("==================================================================\n");

    return {
      success: false,
      devExhausted: true,
      gatewayExhausted: true,
      message: smsFailureMessage,
      devStatus: devReason,
      gatewayStatus: gatewayRes.reason,
    };
  }

  /**
   * Emergency SOS Alert SMS (Sent to Trusted Contacts)
   */
  async sendSOSEmergencySMS({
    phoneNumbers,
    womanName,
    womanAddress,
    womanLat,
    womanLng,
    womanPhone,
    emergencyType,
  }) {
    const name = womanName || "Woman User";
    const mapsUrl = `https://maps.google.com/?q=${womanLat},${womanLng}`;
    const time = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const messageText = `🚨 SAFEHER EMERGENCY SOS!
${name} ne abhi SOS alert on kiya hai!
Type: ${emergencyType || "Immediate Help Needed"}
Time: ${time}
Location: ${womanAddress || "Live GPS Location"}
Live Map: ${mapsUrl}
Call User: ${womanPhone || "N/A"}
Agar user se baat na ho to turant 112 par call karein!`;

    return this.dispatchSMS({
      numbers: phoneNumbers,
      messageText,
    });
  }

  /**
   * Volunteer Assigned SMS (Sent to Trusted Contacts)
   */
  async sendSOSVolunteerAssignedSMS({
    phoneNumbers,
    womanName,
    volunteerName,
    volunteerPhone,
    volunteerEmail,
    distance,
  }) {
    const wName = womanName || "Woman User";
    const vName = volunteerName || "Verified Volunteer";

    const messageText = `🛡️ SAFEHER SOS UPDATE:
Help is on the way for ${wName}!
Volunteer ${vName} ne SOS request accept kar li hai.
Phone: ${volunteerPhone || "N/A"}
Email: ${volunteerEmail || "N/A"}
Distance: ${distance || "En route"}
Volunteer live location par pahunch raha hai.`;

    return this.dispatchSMS({
      numbers: phoneNumbers,
      messageText,
    });
  }
}

module.exports = new SMSService();
