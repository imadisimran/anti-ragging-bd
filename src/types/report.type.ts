export interface ShortReport {
    postId: string;
    userId: string;
    title: string;
    description: string;
    dateTime: Date;
    location: string;
    createdAt: Date;
    status: string;
    upVotesCount?: number;
    upVotesBy?: string[];
}

export interface ShortReports {
    success: boolean;
    data?: ShortReport[];
    error?: string;
}

export interface ReportDetail {
    success: boolean;
    data?: {
        postId: string;
        userId: string;
        university: string;
        reporterUniversity?: string;
        academicSession?: string;
        dateTime: Date;
        harassmentType: string;
        specificLocation: string;
        proofUrls: string[];
        createdAt: Date;
        detectedSeverity: string;
        status: string;
        title: string;
        description: string;
    };
    error?: string;
}