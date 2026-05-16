import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { envVars } from "../config/env";
import AppError from "../errorHandlers/appError";
import { StatusCodes } from "http-status-codes";

// Lazy singleton — reused across warm serverless invocations.
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host:   envVars.SMTP_HOST,
      port:   envVars.SMTP_PORT,
      secure: envVars.SMTP_PORT === 465, // true for 465, STARTTLS for 587
      auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

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

    await getTransporter().sendMail({
      from:    `Mission Bazar <${envVars.SMTP_FROM}>`,
      to:      options.to,
      subject: options.subject,
      html,
      attachments: options.attachments?.map((a) => ({
        filename:    a.filename,
        content:     a.content,
        contentType: a.contentType,
      })),
    });

    console.log(`✉  Email sent to ${options.to} [${options.subject}]`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Email sending failed: ${msg}`
    );
  }
};
