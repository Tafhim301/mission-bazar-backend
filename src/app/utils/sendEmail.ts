import { Resend } from "resend";
import path from "path";
import ejs from "ejs";
import { envVars } from "../config/env";
import AppError from "../errorHandlers/appError";
import { StatusCodes } from "http-status-codes";

// Resend sends over HTTPS (port 443) — never blocked by cloud hosts.
const resend = new Resend(envVars.RESEND_API_KEY);

export interface ISendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, unknown>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async (options: ISendEmailOptions): Promise<void> => {
  try {
    const templatePath = path.join(
      __dirname,
      "templates",
      `${options.templateName}.ejs`
    );

    const html = await ejs.renderFile(templatePath, options.templateData ?? {});

    const { error } = await resend.emails.send({
      from: `Mission Bazar <${envVars.SMTP_FROM}>`,
      to: options.to,
      subject: options.subject,
      html,
      attachments: options.attachments?.map((a) => ({
        filename:    a.filename,
        content:     a.content instanceof Buffer ? a.content.toString("base64") : a.content,
        contentType: a.contentType,
      })),
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(`✉  Email sent to ${options.to} [${options.subject}]`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Email sending failed: ${msg}`
    );
  }
};
