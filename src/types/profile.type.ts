export interface StudentProfileData {
  name: string;
  email: string;
  provider: string;
  updatedAt: Date;
  isVerified: boolean;
  studentDetails?: {
    university: string;
    academicSession: string;
    study: {
      type: string; // "department" | "institute" | ""
      name: string;
    };
    residence: {
      type: string; // "hall" | "hostel" | ""
      name: string;
    };
  };
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
  facultyType: string;
  residentialType: string;
}

export interface GetUniversity {
  university: string
}

export interface GetStudyAreas {
  [locationType: string]: string[];
}