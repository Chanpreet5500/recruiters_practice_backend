import { model, Schema } from 'mongoose'

const PotDSchema = new Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    user_id: {
        type: Number,
        alias: 'userId'
    },
    pic_url: {
        type: String,
        alias: 'picUrl',
    },
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
})

export const PotD = model('potd', PotDSchema)