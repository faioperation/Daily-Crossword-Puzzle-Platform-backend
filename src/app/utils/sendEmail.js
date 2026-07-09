import ejs from "ejs";
import sgMail from "@sendgrid/mail";
import path from "path";
import { fileURLToPath } from "url";
import { envVars } from "../config/env.js";
import DevBuildError from "../lib/DevBuildError.js";

// Needed because __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure SendGrid
sgMail.setApiKey(envVars.SENDGRID.API_KEY);

// SEND EMAIL

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData = {},
  attachments = [],
  replyTo,
  senderType = "default",
}) => {
  try {
    const templatePath = path.join(
      __dirname,
      "template",
      `${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const isGiveaway = senderType === "giveaway";
    const fromEmail = isGiveaway ? envVars.SENDGRID.GIVEAWAY_FROM : envVars.SENDGRID.FROM;
    const fromName = isGiveaway ? envVars.SENDGRID.GIVEAWAY_FROM_NAME : envVars.SENDGRID.FROM_NAME;
    const defaultReplyTo = isGiveaway ? envVars.SENDGRID.GIVEAWAY_REPLY_TO : envVars.SENDGRID.REPLY_TO;

    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName,
      },
      replyTo: replyTo || defaultReplyTo,
      subject,
      html,
      attachments: attachments.map((file) => {
        let base64Content = "";
        if (Buffer.isBuffer(file.content)) {
          base64Content = file.content.toString("base64");
        } else if (typeof file.content === "string") {
          // Check if already base64 encoded, otherwise encode it
          const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(file.content) && file.content.length % 4 === 0;
          base64Content = isBase64 ? file.content : Buffer.from(file.content).toString("base64");
        }
        return {
          filename: file.filename,
          content: base64Content,
          type: file.contentType,
          disposition: "attachment",
        };
      }),
    };

    const response = await sgMail.send(msg);
    console.log(`📧 Email sent to ${to} via SendGrid | Status: ${response[0].statusCode}`);
  } catch (error) {
    console.error("❌ SendGrid Email sending failed:", error?.response?.body || error?.message || error);
    if (envVars.NODE_ENV === "production") {
      throw new DevBuildError("Failed to send email", 500);
    }
    console.log("⚠️ Email sending skipped in development.");
  }
};
