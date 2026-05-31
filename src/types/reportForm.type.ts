import { ObjectId } from "mongodb"

export interface GetLocation {
    _id: string,
    [category: string]: string[] | string
}