"use server";
import { authOptions } from "@/lib/authOptions";
import { collections, dbConnect } from "@/lib/dbConnect";
import { encryptData, generateBlindIndex } from "@/lib/encryption";
import bcrypt from "bcryptjs";
import { ObjectId, WithId } from "mongodb";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

interface RegisterUser {
  name: string;
  email: string;
  password: string;
}
interface NewUser {
  name: string;
  email: string;
  password: string;
  emailSearchHash: string;
  createdAt: Date;
  role: string;
  userId: string;
  provider: string;
  isVerified: boolean;
}

interface LoginUser {
  email: string;
  password: string;
}

interface RegisterUserReturn {
  success: boolean;
  message: string;
}


interface DBuser {
  _id: ObjectId;
  name: string;
  email: string;
  emailSearchHash: string;
  createdAt: Date;
  role: string;
  userId: string;
  provider: string;
  isVerified: boolean;
  password?: string;
}

interface LoginUserReturn {
  success: boolean;
  message: string;
  user?: DBuser
}


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
    const userId = `U${nanoid(10)}`;
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
    console.log(error);
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
    const user = await dbConnect(collections.USERS).findOne({
      emailSearchHash,
    }) as DBuser | null;
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const isPasswordValid = await bcrypt.compare(password, user?.password || "");
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

interface SocialData {
  name: string;
  email: string;
  provider: string;
  isVerified: boolean;
}

interface SocialUser {
  name: string;
  email: string;
  emailSearchHash: string;
  createdAt: Date;
  role: string;
  userId: string;
  provider: string;
  isVerified: boolean;
}

interface SocialReturn {
  success: boolean;
  message: string;
  user?: (SocialUser & { _id: ObjectId });
}

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
    const user = await dbConnect(collections.USERS).findOne({
      emailSearchHash,
    }) as (SocialUser & { _id: ObjectId }) | null;
    if (user) {
      return { success: true, message: "User already exists", user };
    }
    const encryptedName = encryptData(name);
    const encryptedEmail = encryptData(email);
    const userId = `U${nanoid(10)}`;
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
        user: { ...newUser, _id: result.insertedId },
      };
    }

    return { success: false, message: "Failed to register user" };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Something went wrong" };
  }
};

interface TokenData {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

interface VerifyTokenReturn {
  success: boolean;
  message: string;
}

export const verifyToken = async (token: string): Promise<VerifyTokenReturn> => {
  try {
    const session = await getServerSession(authOptions);
    const [tokenData] = await dbConnect(collections.VERIFICATION_TOKENS).find({
      email: session?.user?.email,
    }).sort({ createdAt: -1 }).limit(1).toArray() as (TokenData & { _id: ObjectId })[];
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
    const emailSearchHash = generateBlindIndex(session?.user?.email || "");

    const [updateUser] = await Promise.all([
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

interface GetUserInfo {
  success: boolean;
  message: string;
  user?: {
    role: string;
    isVerified: boolean;
  };
}

interface UserInfoDB {
  role: string;
  isVerified: boolean;
  _id: ObjectId;
}

export const getUserInfo = async (email: string): Promise<GetUserInfo> => {
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
    ) as UserInfoDB | null;
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
