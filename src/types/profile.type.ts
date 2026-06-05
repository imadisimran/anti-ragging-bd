export interface StudentProfileData {
  name: string;
  email: string;
  provider: string;
  department: string;
  academicSession: string;
  residentialHall: string;
  university: string;
  updatedAt: Date;
  isVerified: boolean;
}

export interface ProfileActionResponse<Data = any> {
  success: boolean;
  message: string;
  data?: Data;
}

export interface UpdateProfileData {
  name: string;
  department: string;
  academicSession: string;
  residentialHall: string;
  university: string;
  facultyType: string
}

export interface GetUniversity {
  university: string
}

export interface GetStudyAreas {
  [locationType: string]: string[];
}