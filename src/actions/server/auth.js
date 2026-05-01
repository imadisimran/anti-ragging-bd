"use server";
import { collections, dbConnect } from "@/lib/dbConnect";
import { encryptData, generateBlindIndex } from "@/lib/encryption";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

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
    const userId = nanoid(10);
    const newUser = {
      name: encryptedName,
      email: encryptedEmail,
      password: encryptedPassword,
      emailSearchHash,
      createdAt: new Date(),
      role: "student",
      userId,
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
// export const loginUser = () => {};
