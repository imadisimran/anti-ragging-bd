"use server";
import { authOptions } from "@/lib/authOptions";
import { collections, dbConnect } from "@/lib/dbConnect";
import { encryptData, generateBlindIndex } from "@/lib/encryption";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

export const registerUser = async (data) => {
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
    const userId = `U${nanoid(10)}`;
    const newUser = {
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
    console.log(error);
    return { success: false, message: "Something went wrong" };
  }
};
export const loginUser = async (data) => {
  const { email, password } = data;
  if (!email || !password) {
    return { success: false, message: "All fields are required" };
  }
  try {
    const emailSearchHash = generateBlindIndex(email);
    const user = await dbConnect(collections.USERS).findOne({
      emailSearchHash,
    });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid password" };
    }
    delete user.password;
    return {
      success: true,
      message: "User logged in successfully",
      user,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const saveSocialUser = async (data) => {
  const { name, email, image, provider, isVerified } = data;
  if (!name || !email || !image || !provider) {
    return { success: false, message: "All fields are required" };
  }
  if (!isVerified) {
    return { success: false, message: "Email not verified" };
  }
  try {
    const emailSearchHash = generateBlindIndex(email);
    const user = await dbConnect(collections.USERS).findOne({
      emailSearchHash,
    });
    if (user) {
      return { success: true, message: "User already exists", user };
    }
    const encryptedName = encryptData(name);
    const encryptedEmail = encryptData(email);
    const userId = `U${nanoid(10)}`;
    const newUser = {
      name: encryptedName,
      email: encryptedEmail,
      image,
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
        user: newUser,
      };
    }

    return { success: false, message: "Failed to register user" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const verifyToken = async (token) => {
  try {
    const session = await getServerSession(authOptions);
    const [tokenData] = await dbConnect(collections.VERIFICATION_TOKENS).find({
      email: session?.user?.email,
    }).sort({createdAt:-1}).limit(1).toArray();
    // console.log(tokenData)
    if (!tokenData) {
      return { success: false, message: "Token not found" };
    }
    const isTokenValid = tokenData.token === token;
    if (!isTokenValid) {
      return { success: false, message: "Invalid token" };
    }
    const isTokenExpired = new Date() > tokenData.expiresAt;
    if (isTokenExpired) {
      return { success: false, message: "Token expired" };
    }
    const emailSearchHash = generateBlindIndex(session?.user?.email);

    const [updateUser, deleteToken] = await Promise.all([
      dbConnect(collections.USERS).updateOne(
        {
          emailSearchHash,
        },
        {
          $set: {
            isVerified: true,
          },
        },
      ),
      dbConnect(collections.VERIFICATION_TOKENS).deleteMany({
        email: session?.user?.email,
      }),
    ]);
    return {
      success: updateUser?.acknowledged,
      message: updateUser?.acknowledged
        ? "Token verified successfully"
        : "Failed to verify token",
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Something went wrong" };
  }
};

export const getUserInfo = async (email) => {
  // console.log("getUserInfo called with email:", email);
  if (!email) return { success: false, message: "No email provided" };
  try {
    const emailSearchHash = generateBlindIndex(email);
    const user = await dbConnect(collections.USERS).findOne(
      {
        emailSearchHash,
      },
      {
        projection: {
          role: 1,
          isVerified: 1,
        },
      },
    );
    if (!user) {
      return { success: false, message: "User not found" };
    }
    return {
      success: true,
      message: "User found",
      user,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Something went wrong" };
  }
};
