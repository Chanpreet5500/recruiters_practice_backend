import { model, Schema, Document } from 'mongoose'
import { IJob} from '../interfaces'

type JobType = IJob;
const JobSchema = new Schema({
    name: {
        type: String,
        alias: 'jobName',
    },
    type: {
        type: String,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    job_id: {
        type: String,
    },
    education: {
        type: String,
    },
    client_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    candidates: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    parameters : [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: 'Param'
            },
            name : String,
            value: String
        }
    ],
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
    status: {
        type: Number,
    },
})

export const Jobs = model<JobType>('jobs', JobSchema)