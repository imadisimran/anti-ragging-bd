"use server";

import { authOptions } from "@/lib/authOptions";
import { collections, dbConnect } from "@/lib/dbConnect";
import { encryptData, generateBlindIndex } from "@/lib/encryption";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import {
  RegisterUser,
  NewUser,
  LoginUser,
  RegisterUserReturn,
  DBuser,
  LoginUserReturn,
  SocialData,
  SocialUser,
  SocialReturn,
  VerifyTokenReturn,
  GetUserInfo,
} from "@/types/auth.type";

export const registerUser = async (data: RegisterUser): Promise<RegisterUserReturn> => {
  const { name, email, password } = data;
  if (!name || !email || !password) {
    return { success: false, message: "All fields are required" };
  }
  try {
    const emailSearchHash = generateBlindIndex(email);
    const user = await dbConnect(collections.USERS).findOne({
      emailSearchHash,
    });
    if (user) {
      return { success: false, message: "User already exists" };
    }
    const encryptedName = encryptData(name);
    const encryptedEmail = encryptData(email);
    const encryptedPassword = await bcrypt.hash(password, 10);
    const userId = nanoid(10);

    const newUser: NewUser = {
      name: encryptedName,
      email: encryptedEmail,
      password: encryptedPassword,
      emailSearchHash,
      createdAt: new Date(),
      role: "student",
      userId,
      provider: "credentials",
      isVerified: false,
    };

    const result = await dbConnect(collections.USERS).insertOne(newUser);
    return {
      success: result.acknowledged,
      message: result.acknowledged
        ? "User registered successfully"
        : "Failed to register user",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const loginUser = async (data: LoginUser): Promise<LoginUserReturn> => {
  const { email, password } = data;
  if (!email || !password) {
    return { success: false, message: "All fields are required" };
  }
  try {
    const emailSearchHash = generateBlindIndex(email);
    const rawUser = await dbConnect(collections.USERS).findOne({
      emailSearchHash,
    });
    if (!rawUser) {
      return { success: false, message: "User not found" };
    }

    const isPasswordValid = await bcrypt.compare(password, rawUser?.password || "");
    if (!isPasswordValid) {
      return { success: false, message: "Invalid password" };
    }

    const sanitizedUser: DBuser = {
      _id: rawUser._id.toString(),
      name: rawUser.name,
      email: rawUser.email,
      emailSearchHash: rawUser.emailSearchHash,
      createdAt: rawUser.createdAt,
      role: rawUser.role,
      userId: rawUser.userId,
      provider: rawUser.provider,
      isVerified: rawUser.isVerified,
      password: rawUser.password,
    };

    return {
      success: true,
      message: "User logged in successfully",
      user: sanitizedUser,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const saveSocialUser = async (data: SocialData): Promise<SocialReturn> => {
  const { name, email, provider, isVerified } = data;
  if (!name || !email || !provider) {
    return { success: false, message: "All fields are required" };
  }
  if (!isVerified) {
    return { success: false, message: "Email not verified" };
  }
  try {
    const emailSearchHash = generateBlindIndex(email);
    const rawUser = await dbConnect(collections.USERS).findOne({
      emailSearchHash,
    });

    if (rawUser) {
      return {
        success: true,
        message: "User already exists",
        user: {
          name: rawUser.name,
          email: rawUser.email,
          emailSearchHash: rawUser.emailSearchHash,
          createdAt: rawUser.createdAt,
          role: rawUser.role,
          userId: rawUser.userId,
          provider: rawUser.provider,
          isVerified: rawUser.isVerified,
          _id: rawUser._id.toString(),
        },
      };
    }

    const encryptedName = encryptData(name);
    const encryptedEmail = encryptData(email);
    const userId = nanoid(10);
    const newUser: SocialUser = {
      name: encryptedName,
      email: encryptedEmail,
      emailSearchHash,
      createdAt: new Date(),
      role: "student",
      userId,
      provider,
      isVerified,
    };

    const result = await dbConnect(collections.USERS).insertOne(newUser);
    if (result.acknowledged) {
      return {
        success: true,
        message: "User registered successfully",
        user: { ...newUser, _id: result.insertedId.toString() },
      };
    }

    return { success: false, message: "Failed to register user" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const verifyToken = async (token: string): Promise<VerifyTokenReturn> => {
  try {
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;

    if (!sessionEmail) {
      return { success: false, message: "Unauthorized or missing email session" };
    }

    const tokens = await dbConnect(collections.VERIFICATION_TOKENS)
      .find({ email: sessionEmail })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    const rawTokenData = tokens[0];
    if (!rawTokenData) {
      return { success: false, message: "Token not found" };
    }
    const isTokenValid = rawTokenData.token === token;
    if (!isTokenValid) {
      return { success: false, message: "Invalid token" };
    }
    const isTokenExpired = new Date() > rawTokenData.expiresAt;
    if (isTokenExpired) {
      return { success: false, message: "Token expired" };
    }

    const emailSearchHash = generateBlindIndex(sessionEmail);

    const [updateUser] = await Promise.all([
      dbConnect(collections.USERS).updateOne(
        { emailSearchHash },
        { $set: { isVerified: true } },
      ),
      dbConnect(collections.VERIFICATION_TOKENS).deleteMany({
        email: sessionEmail,
      }),
    ]);

    return {
      success: !!updateUser?.acknowledged,
      message: updateUser?.acknowledged
        ? "Token verified successfully"
        : "Failed to verify token",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getUserInfo = async (email: string): Promise<GetUserInfo> => {
  if (!email) return { success: false, message: "No email provided" };
  try {
    const emailSearchHash = generateBlindIndex(email);
    const rawUser = await dbConnect(collections.USERS).findOne(
      { emailSearchHash },
      { projection: { role: 1, isVerified: 1 } }
    );

    if (!rawUser) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      message: "User found",
      user: {
        role: rawUser.role,
        isVerified: rawUser.isVerified,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Something went wrong" };
  }
};