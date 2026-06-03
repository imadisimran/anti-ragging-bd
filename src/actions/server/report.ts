"use server"
import { collections, dbConnect } from "@/lib/dbConnect"
import { ShortReport } from "@/types/report.type"

export const getShortReport = async (): Promise<ShortReport[]> => {
    try {
        const rawData = await dbConnect(collections.REPORTS).find({ isRaggingIncident: true }, { projection: { postId: 1, sanitizedTitle: 1, sanitizedDescription: 1, dateTime: 1, location: 1, createdAt: 1, userId: 1, status: 1 } }).toArray()
        const data: ShortReport[] = rawData.map(item => ({
            postId: item.postId,
            userId: item.userId.split(":")[0],
            title: item.sanitizedTitle,
            description: item.sanitizedDescription,
            dateTime: item.dateTime,
            location: item.location,
            createdAt: item.createdAt,
            status: item.status
        }))
        return data
    } catch (error) {
        console.log(error)
        return []
    }
}