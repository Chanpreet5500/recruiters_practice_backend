import { model, Schema } from 'mongoose'
const ExhibitionsSchema = new Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    user_id: {
        type: String,
        alias: 'userId',
    },
    country: {
        type: Number,
    },
    city: {
        type: Number,
    },
    pic_url: {
        type: String,
        alias: 'picUrl'
    },
    start_date: {
        type: Date,
        alias: 'startDate',
    },
    end_date: {
        type: Date,
        alias: 'endDate',
    },
    is_permanent: {
        type: Number,
        alias: 'isPermanent',
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

export const Exhibitions = model('exhibitions', ExhibitionsSchema)