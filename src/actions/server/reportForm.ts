"use server"

import { dbConnect, collections } from "@/lib/dbConnect"
import { GetLocation } from "@/types/api"

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