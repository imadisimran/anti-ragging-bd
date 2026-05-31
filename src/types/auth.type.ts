export interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface NewUser {
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

export interface LoginUser {
  email: string;
  password: string;
}

export interface RegisterUserReturn {
  success: boolean;
  message: string;
}

export interface DBuser {
  _id: string; 
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

export interface LoginUserReturn {
  success: boolean;
  message: string;
  user?: DBuser;
}

export interface SocialData {
  name: string;
  email: string;
  provider: string;
  isVerified: boolean;
}

export interface SocialUser {
  name: string;
  email: string;
  emailSearchHash: string;
  createdAt: Date;
  role: string;
  userId: string;
  provider: string;
  isVerified: boolean;
}

export interface SocialReturn {
  success: boolean;
  message: string;
  user?: (SocialUser & { _id: string }); 
}

export interface TokenData {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface VerifyTokenReturn {
  success: boolean;
  message: string;
}

export interface GetUserInfo {
  success: boolean;
  message: string;
  user?: {
    role: string;
    isVerified: boolean;
  };
}

export interface UserInfoDB {
  role: string;
  isVerified: boolean;
  _id: string; 
}