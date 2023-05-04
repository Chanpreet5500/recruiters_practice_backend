import { model, Schema } from 'mongoose'

const ModerationTypesSchema = new Schema({
    title: {
        type: String,
    },
    description: {
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

export const ModerationTypes = model('moderation_types', ModerationTypesSchema)