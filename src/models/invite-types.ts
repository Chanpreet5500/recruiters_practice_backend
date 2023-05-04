import { model, Schema } from 'mongoose'

const InviteTypesSchema = new Schema({
    title: {
        type: String,
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

export const InviteTypes = model('invite_types', InviteTypesSchema)