"use server"

import { dbConnect, collections } from "@/lib/dbConnect"
import { GetLocation } from "@/types/reportForm.type"
import { v2 as cloudinary } from 'cloudinary'

export const getLocation = async (universityName: string, category: string): Promise<GetLocation | null> => {
    if (!category) {
        return null
    }
    const data = await dbConnect(collections.UNIVERSITIES).findOne({ university: universityName }, { projection: { [category]: 1 } })
    if (!data) {
        return null
    }
    const newData: GetLocation = { ...data, _id: data._id.toString() }
    return newData
}

const uploadToCloudinary = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "anti-ragging-reports" },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result?.secure_url || "");
                }
            }
        ).end(buffer);
    });
};

export const postReport = async (reportData: FormData) => {
    try {
        const university = reportData.get("university") as string;
        const dateTime = reportData.get("dateTime") as string;
        const harassmentType = reportData.get("harassmentType") as string;
        const locationCategory = reportData.get("locationCategory") as string;
        const specificLocation = reportData.get("specificLocation") as string;
        const narrative = reportData.get("narrative") as string;

        // Retrieve all files (using getAll since fromEntries or get only retrieves the first file)
        const files = reportData.getAll("proofFiles") as File[];

        // Upload files to Cloudinary
        const uploadPromises = files
            .filter((file) => file.size > 0 && file.name !== "undefined")
            .map((file) => uploadToCloudinary(file));

        const proofUrls = await Promise.all(uploadPromises);

        const payload = {
            university,
            dateTime: new Date(dateTime),
            harassmentType,
            locationCategory,
            specificLocation,
            narrative,
            proofUrls,
        };

        const result = await dbConnect(collections.REPORTS).insertOne(payload)

        if (result.acknowledged) {
            return {
                success: true,
                message: "Report submitted successfully"
            }
        }
        return {
            success: false,
            message: "Failed to submit report"
        };
    } catch (error) {
        console.error("Error in postReport Server Action:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to submit report due to an unexpected error"
        };
    }
};