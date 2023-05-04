// const mongoose = require("mongoose")
import { model, Schema, Document } from 'mongoose'
import { IParams } from '../interfaces'
type ParamsType = IParams & Document;

const ParamSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    esName:{
        type: String
    },
    esDescription:{
        type : String
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    } ,
    date_created: {
        type: Date,
        alias: 'dateCreated',
    },
    date_updated: {
        type: Date,
        alias: 'dateUpdated',
    },
    is_deleted: {
        type: Number,
        alias: 'isDeleted'
    },  
    language : {
        type : String,
        alias: 'lang'
    },
    status: {
        type: Number,
    },
})

export const Param = model<ParamsType>('params',ParamSchema)
