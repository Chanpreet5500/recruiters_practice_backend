import { model, Schema } from 'mongoose'
const GroupPostsSchema = new Schema({
    group_id: {
        type: Number,
        alias: 'groupId',
    },
    content: {
        type: String,
    },
    likes: {
        type: String,
    },
    comments: {
        type: String,
    },
    shares: {
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

export const GroupPosts = model('group_posts', GroupPostsSchema)