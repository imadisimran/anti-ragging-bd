"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { nanoid } from "nanoid";
import { collections, dbConnect } from "@/lib/dbConnect";
import { render } from "react-email";
import nodemailer from "nodemailer";
import VerificationEmail from "../../../emails/verification-email";

export const sendVerificationEmail = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return {
        success: false,
        message: "Please use the same device which used for registration",
      };
    }

    const verificationToken = nanoid(20);
    const expiresAt = new Date(Date.now() + 60 * 10 * 1000);
    const newVerificationToken = {
      email: session.user.email,
      token: verificationToken,
      expiresAt,
      createdAt:new Date()
    };

    const result = await dbConnect(collections.VERIFICATION_TOKENS).insertOne(
      newVerificationToken
    );

    if (!result.acknowledged) {
      return { success: false, message: "Failed to create verification token" };
    }

    const emailHtml = await render(
      <VerificationEmail
        name={session.user.name ?? ""}
        verificationUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/verify-email/verify?token=${verificationToken}`}
      />
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Anti-Ragging BD" <${process.env.SMTP_USER}>`,
      to: session.user.email,
      subject: "Verify your email address",
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Verification email sent successfully please check your inbox",
    };
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);
    return {
      success: false,
      message: "An unexpected error occurred while sending the verification email.",
    };
  }
};