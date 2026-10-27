const tls = require("tls");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

class GoogleMailService {
  constructor() {
    this.host = "smtp.gmail.com";
    this.port = 465;
  }

  getUser() {
    return (process.env.GMAIL_USER || "").trim();
  }

  getAppPassword() {
    return (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "").trim();
  }

  isConfigured() {
    const user = this.getUser();
    const pass = this.getAppPassword();
    return Boolean(user && pass && user.includes("@") && pass.length >= 8);
  }

  /**
   * Sends raw email via Google TLS SMTP
   */
  async sendMail({ to, subject, html, text, inlineAttachments = [] }) {
    const recipients = (Array.isArray(to) ? to : [to])
      .map((e) => (typeof e === "string" ? e.trim() : ""))
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (recipients.length === 0) {
      console.warn(
        "⚠️ [SafeHer Mail] No valid recipient email addresses provided.",
      );
      return { success: false, reason: "No valid recipient email addresses." };
    }

    const fromUser = this.getUser();
    const appPassword = this.getAppPassword();

    // If Google credentials are not yet added to .env, log a clear preview
    if (!this.isConfigured()) {
      console.log(
        "\n==================================================================",
      );
      console.log("🚨 [SAFEHER GOOGLE MAIL SERVICE - PREVIEW MODE]");
      console.log(`✉️  RECIPIENTS: ${recipients.join(", ")}`);
      console.log(`📌 SUBJECT:    ${subject}`);
      console.log(
        "------------------------------------------------------------------",
      );
      console.log(text || "Emergency SOS Details Dispatched");
      console.log(
        "------------------------------------------------------------------",
      );
      console.log("ℹ️  HOW TO SEND REAL EMAILS VIA GMAIL FOR FREE:");
      console.log(
        "1. Open Google Account -> Security -> 2-Step Verification (turn ON).",
      );
      console.log(
        "2. Under 2-Step Verification -> App Passwords -> Create new app 'SafeHer'.",
      );
      console.log("3. Copy the 16-letter password and add to server/.env:");
      console.log("   GMAIL_USER=yourgmail@gmail.com");
      console.log("   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx");
      console.log(
        "==================================================================\n",
      );

      return {
        success: true,
        preview: true,
        message:
          "Email preview logged in server terminal (no Gmail credentials in .env).",
      };
    }

    return new Promise((resolve, reject) => {
      let state = "CONNECT";
      let rcptIndex = 0;
      let lineBuffer = "";
      let isResolved = false;

      const socket = tls.connect(
        {
          host: this.host,
          port: this.port,
          timeout: 20000,
        },
        () => {
          // Connected
        },
      );

      const cleanup = () => {
        try {
          socket.removeAllListeners();
          socket.end();
          socket.destroy();
        } catch (_) {}
      };

      const finishResolve = (val) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(val);
        }
      };

      const finishReject = (err) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(err);
        }
      };

      const send = (data) => {
        socket.write(data + "\r\n");
      };

      const handleReply = (code, fullMsg) => {
        if (code >= 400) {
          console.error(`❌ [Google SMTP Error] ${code}: ${fullMsg}`);
          return finishReject(
            new Error(`Google SMTP Error ${code}: ${fullMsg}`),
          );
        }

        switch (state) {
          case "CONNECT":
            if (code === 220) {
              state = "EHLO";
              send("EHLO safeher.system");
            }
            break;

          case "EHLO":
            if (code === 250) {
              state = "AUTH_LOGIN";
              send("AUTH LOGIN");
            }
            break;

          case "AUTH_LOGIN":
            if (code === 334) {
              state = "AUTH_USER";
              send(Buffer.from(fromUser).toString("base64"));
            }
            break;

          case "AUTH_USER":
            if (code === 334) {
              state = "AUTH_PASS";
              send(Buffer.from(appPassword).toString("base64"));
            }
            break;

          case "AUTH_PASS":
            if (code === 235) {
              state = "MAIL_FROM";
              send(`MAIL FROM:<${fromUser}>`);
            }
            break;

          case "MAIL_FROM":
            if (code === 250) {
              state = "RCPT_TO";
              send(`RCPT TO:<${recipients[rcptIndex]}>`);
            }
            break;

          case "RCPT_TO":
            if (code === 250) {
              rcptIndex++;
              if (rcptIndex < recipients.length) {
                send(`RCPT TO:<${recipients[rcptIndex]}>`);
              } else {
                state = "DATA";
                send("DATA");
              }
            }
            break;

          case "DATA":
            if (code === 354) {
              state = "CONTENT";
              const messageDate = new Date().toUTCString();
              const boundary = `safeher_boundary_${Date.now()}`;
              const alternativeBoundary = `${boundary}_alternative`;
              const relatedBoundary = `${boundary}_related`;
              const hasInlineAttachments = inlineAttachments.length > 0;
              const headers = [
                `From: "SafeHer Women Safety" <${fromUser}>`,
                `To: ${recipients.join(", ")}`,
                `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
                `Date: ${messageDate}`,
                `MIME-Version: 1.0`,
                `Importance: high`,
                `X-Priority: 1`,
                hasInlineAttachments
                  ? `Content-Type: multipart/related; boundary="${relatedBoundary}"`
                  : `Content-Type: multipart/alternative; boundary="${boundary}"`,
                "",
                ...(hasInlineAttachments
                  ? [
                      `--${relatedBoundary}`,
                      `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
                      "",
                    ]
                  : []),
                `--${hasInlineAttachments ? alternativeBoundary : boundary}`,
                `Content-Type: text/plain; charset=UTF-8`,
                `Content-Transfer-Encoding: 8bit`,
                "",
                text || "Emergency SOS Alert",
                "",
                `--${hasInlineAttachments ? alternativeBoundary : boundary}`,
                `Content-Type: text/html; charset=UTF-8`,
                `Content-Transfer-Encoding: 8bit`,
                "",
                html || `<p>${text || "Emergency SOS Alert"}</p>`,
                "",
                `--${hasInlineAttachments ? alternativeBoundary : boundary}--`,
                ...(hasInlineAttachments
                  ? inlineAttachments.flatMap((attachment) => [
                      "",
                      `--${relatedBoundary}`,
                      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
                      "Content-Transfer-Encoding: base64",
                      `Content-ID: <${attachment.contentId}>`,
                      `Content-Disposition: inline; filename="${attachment.filename}"`,
                      "",
                      attachment.content
                        .toString("base64")
                        .match(/.{1,76}/g)
                        .join("\r\n"),
                    ])
                  : []),
                ...(hasInlineAttachments ? [`--${relatedBoundary}--`] : []),
                ".",
              ].join("\r\n");

              socket.write(headers + "\r\n");
            }
            break;

          case "CONTENT":
            if (code === 250) {
              state = "QUIT";
              send("QUIT");
            }
            break;

          case "QUIT":
            console.log(
              `✅ [SafeHer Mail] Email sent successfully via Google to: ${recipients.join(", ")}`,
            );
            finishResolve({
              success: true,
              message: "Email delivered via Google Gmail SMTP.",
            });
            break;
        }
      };

      socket.on("data", (chunk) => {
        lineBuffer += chunk.toString("utf8");
        const lines = lineBuffer.split("\r\n");
        lineBuffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          const match = line.match(/^(\d{3})([ -])(.*)$/);
          if (match) {
            const code = parseInt(match[1], 10);
            const isTerminal = match[2] === " ";
            if (isTerminal) {
              handleReply(code, line);
            }
          }
        }
      });

      socket.on("error", (err) => {
        console.error("❌ [Google TLS Socket Error]:", err.message);
        finishReject(err);
      });

      socket.on("timeout", () => {
        console.error("❌ [Google SMTP Timeout]");
        finishReject(new Error("Connection to Google SMTP timed out."));
      });
    });
  }

  /**
   * Helper 1: Trigger Emergency SOS Email to Trusted Contacts
   */
  async sendSOSEmergencyEmail({
    recipients,
    womanName,
    womanPhone,
    womanEmail,
    womanAddress,
    womanLat,
    womanLng,
    emergencyType,
  }) {
    if (!recipients || recipients.length === 0)
      return { success: false, reason: "No recipients" };

    const mapsUrl = `https://www.google.com/maps?q=${womanLat},${womanLng}`;
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const name = womanName || "A Woman in Need";

    const subject = `🚨 URGENT: Emergency SOS Alert Activated by ${name}!`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 2px solid #ef4444; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; padding: 30px 25px; text-align: center; }
        .header h1 { margin: 0 0 10px; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 0; font-size: 15px; opacity: 0.95; }
        .content { padding: 30px 25px; }
        .alert-box { background: #fef2f2; border-left: 5px solid #dc2626; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px; }
        .alert-box h3 { margin: 0 0 5px; color: #991b1b; font-size: 17px; }
        .alert-box p { margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5; }
        .card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
        .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .card-row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 600; }
        .value { color: #0f172a; font-weight: 700; text-align: right; }
        .btn { display: block; width: fit-content; margin: 25px auto 10px; background: #dc2626; color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 10px; font-weight: 700; font-size: 16px; text-align: center; box-shadow: 0 4px 12px rgba(220,38,38,0.35); }
        .helplines { background: #ecfdf5; border-radius: 10px; padding: 15px 20px; text-align: center; font-size: 13px; color: #065f46; margin-top: 20px; }
        .helplines strong { color: #047857; font-size: 15px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 EMERGENCY SOS ACTIVATED</h1>
          <p>SafeHer Women Safety Rapid Alert Notification</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <h3>Immediate Attention Required!</h3>
            <p>You are receiving this urgent email because you are listed as a <strong>Trusted Contact</strong> for <strong>${name}</strong>. She has activated the Emergency SOS alert right now.</p>
          </div>

          <div class="card">
            <div class="card-row">
              <span class="label">User Name:</span>
              <span class="value">${name}</span>
            </div>
            <div class="card-row">
              <span class="label">Emergency Type:</span>
              <span class="value" style="color: #dc2626;">${emergencyType || "Emergency SOS Assistance"}</span>
            </div>
            <div class="card-row">
              <span class="label">Phone Number:</span>
              <span class="value">${womanPhone ? `<a href="tel:${womanPhone}" style="color:#2563eb;">${womanPhone}</a>` : "Not provided"}</span>
            </div>
            <div class="card-row">
              <span class="label">User Email:</span>
              <span class="value">${womanEmail || "Not provided"}</span>
            </div>
            <div class="card-row">
              <span class="label">Current Location:</span>
              <span class="value">${womanAddress || "Live GPS Location"}</span>
            </div>
            <div class="card-row">
              <span class="label">GPS Coordinates:</span>
              <span class="value">${womanLat}, ${womanLng}</span>
            </div>
            <div class="card-row">
              <span class="label">Time Triggered:</span>
              <span class="value">${timestamp} IST</span>
            </div>
            <div class="card-row">
              <span class="label">Volunteer Status:</span>
              <span class="value" style="color: #d97706;">Searching Nearby Volunteers...</span>
            </div>
          </div>

          <a href="${mapsUrl}" target="_blank" class="btn">📍 OPEN LIVE GPS LOCATION ON GOOGLE MAPS</a>

          <div class="helplines">
            <strong>Emergency Helpline Numbers:</strong><br/>
            🚨 All Emergency Services: <strong>112</strong> | 👮 Women Helpline: <strong>1091</strong> | 🚓 Police: <strong>100</strong>
          </div>
        </div>
        <div class="footer">
          This is an automated safety alert generated by SafeHer Women Safety System.<br/>
          Please call ${name} immediately or reach out to local emergency authorities.
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
EMERGENCY SOS ALERT ACTIVATED!
SafeHer Women Safety System

User: ${name}
Phone: ${womanPhone || "N/A"}
Email: ${womanEmail || "N/A"}
Location: ${womanAddress || "Live GPS Location"}
Coordinates: ${womanLat}, ${womanLng}
Time: ${timestamp} IST

Google Maps Live Location Link:
${mapsUrl}

Please contact ${name} immediately or dial 112.
    `;

    return this.sendMail({
      to: recipients,
      subject,
      html,
      text,
    });
  }

  /**
   * Helper 2: Volunteer Accepted & En Route Email to Trusted Contacts
   */
  async sendSOSVolunteerAssignedEmail({
    recipients,
    womanName,
    womanPhone,
    womanAddress,
    womanLat,
    womanLng,
    volunteerName,
    volunteerPhoto,
    volunteerPhone,
    volunteerEmail,
    distance,
  }) {
    if (!recipients || recipients.length === 0)
      return { success: false, reason: "No recipients" };

    const mapsUrl = `https://www.google.com/maps?q=${womanLat},${womanLng}`;
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const wName = womanName || "Woman User";
    const vName = volunteerName || "Verified Volunteer";

    const subject = `🛡️ VOLUNTEER ASSIGNED: Help is on the way for ${wName}!`;

    // Embed locally stored photos so recipients do not need access to this server.
    let photoHtml = "";
    const inlineAttachments = [];
    if (typeof volunteerPhoto === "string" && volunteerPhoto.trim()) {
      let photoSrc = "";
      if (/^https?:\/\//i.test(volunteerPhoto)) {
        photoSrc = volunteerPhoto;
      } else {
        const filename = path.basename(volunteerPhoto);
        const extension = path.extname(filename).toLowerCase();
        const contentType =
          extension === ".png"
            ? "image/png"
            : [".jpg", ".jpeg"].includes(extension)
              ? "image/jpeg"
              : null;
        const photoPath = path.join(__dirname, "../volunteer", filename);

        if (contentType && fs.existsSync(photoPath)) {
          try {
            const contentId = `volunteer-photo-${Date.now()}@safeher`;
            inlineAttachments.push({
              content: fs.readFileSync(photoPath),
              contentId,
              contentType,
              filename,
            });
            photoSrc = `cid:${contentId}`;
          } catch (error) {
            console.error(
              "Unable to read volunteer profile photo for email:",
              error,
            );
          }
        } else {
          console.warn(
            `Volunteer profile photo is unavailable for email attachment: ${filename}`,
          );
        }
      }

      if (photoSrc) {
        photoHtml = `
          <div style="text-align: center; margin-bottom: 18px;">
            <img src="${photoSrc}" alt="${vName}" width="110" height="110" style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid #2563eb; box-shadow: 0 4px 14px rgba(37,99,235,0.3);" />
          </div>
        `;
      }
    }
    if (!photoHtml) {
      photoHtml = `
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 90px; height: 90px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-size: 38px; font-weight: 800; border: 3px solid #3b82f6;">
            ${vName.charAt(0).toUpperCase()}
          </div>
        </div>
      `;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 2px solid #2563eb; }
        .header { background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); color: #ffffff; padding: 30px 25px; text-align: center; }
        .header h1 { margin: 0 0 10px; font-size: 24px; font-weight: 800; }
        .header p { margin: 0; font-size: 15px; opacity: 0.95; }
        .content { padding: 30px 25px; }
        .status-box { background: #eff6ff; border-left: 5px solid #2563eb; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px; }
        .status-box h3 { margin: 0 0 5px; color: #1e40af; font-size: 17px; }
        .status-box p { margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.5; }
        .volunteer-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 22px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
        .volunteer-title { font-size: 16px; font-weight: 800; color: #0f172a; text-align: center; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 600; }
        .value { color: #0f172a; font-weight: 700; text-align: right; }
        .btn-call { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 5px 6px; }
        .btn-map { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 5px 6px; }
        .actions-wrap { text-align: center; margin: 25px 0 10px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ VERIFIED VOLUNTEER RESPONDED</h1>
          <p>Help is currently en route to ${wName}</p>
        </div>
        <div class="content">
          <div class="status-box">
            <h3>Assistance En Route</h3>
            <p>A verified SafeHer community volunteer has approved the SOS alert and is actively heading to <strong>${wName}</strong>'s live coordinates.</p>
          </div>

          <div class="volunteer-card">
            <div class="volunteer-title">Responding Volunteer Profile</div>
            ${photoHtml}
            <div class="row">
              <span class="label">Volunteer Name:</span>
              <span class="value">${vName}</span>
            </div>
            <div class="row">
              <span class="label">Phone / Contact:</span>
              <span class="value"><a href="tel:${volunteerPhone || ""}" style="color:#16a34a; text-decoration: none;">📞 ${volunteerPhone || "Not provided"}</a></span>
            </div>
            <div class="row">
              <span class="label">Volunteer Email:</span>
              <span class="value"><a href="mailto:${volunteerEmail || ""}" style="color:#2563eb; text-decoration: none;">✉️ ${volunteerEmail || "Not provided"}</a></span>
            </div>
            <div class="row">
              <span class="label">Current Distance:</span>
              <span class="value" style="color: #2563eb;">${distance || "Live location syncing..."}</span>
            </div>
            <div class="row">
              <span class="label">Accepted At:</span>
              <span class="value">${timestamp} IST</span>
            </div>
          </div>

          <div class="volunteer-card" style="background: #ffffff; border-color: #e2e8f0;">
            <div class="volunteer-title" style="color: #64748b; font-size: 14px;">User Information</div>
            <div class="row">
              <span class="label">Woman User:</span>
              <span class="value">${wName}</span>
            </div>
            <div class="row">
              <span class="label">User Phone:</span>
              <span class="value">${womanPhone || "Not provided"}</span>
            </div>
            <div class="row">
              <span class="label">Location:</span>
              <span class="value">${womanAddress || "Live Location"}</span>
            </div>
          </div>

          <div class="actions-wrap">
            ${volunteerPhone ? `<a href="tel:${volunteerPhone}" class="btn-call">📞 CALL VOLUNTEER</a>` : ""}
            <a href="${mapsUrl}" target="_blank" class="btn-map">📍 VIEW ON GOOGLE MAPS</a>
          </div>
        </div>
        <div class="footer">
          SafeHer Women Safety System | Automated Verified Response Update
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
VOLUNTEER ASSIGNED & EN ROUTE!
SafeHer Women Safety System

A verified volunteer has accepted the SOS alert for ${wName}.

Volunteer Details:
Name: ${vName}
Phone: ${volunteerPhone || "N/A"}
Email: ${volunteerEmail || "N/A"}
Current Distance: ${distance || "Syncing"}
Accepted Time: ${timestamp} IST

Woman User Location:
${womanAddress || "Live GPS Location"} (${womanLat}, ${womanLng})
Google Maps Link: ${mapsUrl}

Please contact the volunteer or user if needed.
    `;

    return this.sendMail({
      to: recipients,
      subject,
      html,
      text,
      inlineAttachments,
    });
  }

  /**
   * Helper 3: SOS Resolved Update Email to Trusted Contacts
   */
  async sendSOSResolvedEmail({
    recipients,
    womanName,
    womanPhone,
    womanAddress,
    womanLat,
    womanLng,
    emergencyType,
    resolvedBy,
    volunteerName,
  }) {
    if (!recipients || recipients.length === 0) {
      return { success: false, reason: "No recipients" };
    }

    const escapeHtml = (value) =>
      String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    const name = escapeHtml(womanName || "Woman User");
    const phone = escapeHtml(womanPhone || "Not provided");
    const address = escapeHtml(womanAddress || "Location unavailable");
    const type = escapeHtml(emergencyType || "Emergency Assistance");
    const resolver = escapeHtml(resolvedBy || "SafeHer user");
    const responder = escapeHtml(volunteerName || "");
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(
      `${womanLat},${womanLng}`,
    )}`;
    const subject = `✅ SOS Resolved: ${womanName || "Woman User"} is safe`;
    const volunteerDetails = responder
      ? `<p><strong>Responding volunteer:</strong> ${responder}</p>`
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#1e293b;">
        <main style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #bbf7d0;border-radius:12px;overflow:hidden;">
          <header style="padding:24px;background:#15803d;color:#fff;text-align:center;">
            <h1 style="margin:0 0 8px;font-size:24px;">SOS Resolved</h1>
            <p style="margin:0;">The emergency alert has been closed.</p>
          </header>
          <section style="padding:24px;">
            <p>This is an update for the trusted contact of <strong>${name}</strong>. The SOS has been marked resolved by <strong>${resolver}</strong>.</p>
            ${volunteerDetails}
            <p><strong>Emergency:</strong> ${type}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Location:</strong> ${address}</p>
            <p><strong>Resolved at:</strong> ${escapeHtml(timestamp)} IST</p>
            <p style="text-align:center;margin:28px 0;">
              <a href="${mapsUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;font-weight:bold;">View location</a>
            </p>
          </section>
          <footer style="padding:16px;text-align:center;background:#f8fafc;color:#64748b;font-size:12px;">
            SafeHer Women Safety System
          </footer>
        </main>
      </body>
      </html>
    `;
    const text = `SOS RESOLVED\n\n${womanName || "Woman User"}'s emergency alert has been marked resolved by ${resolvedBy || "a SafeHer user"}.\n${volunteerName ? `Responding volunteer: ${volunteerName}\n` : ""}Emergency: ${emergencyType || "Emergency Assistance"}\nPhone: ${womanPhone || "Not provided"}\nLocation: ${womanAddress || "Location unavailable"}\nResolved at: ${timestamp} IST\nMap: ${mapsUrl}`;

    return this.sendMail({
      to: recipients,
      subject,
      html,
      text,
    });
  }
}

module.exports = new GoogleMailService();
