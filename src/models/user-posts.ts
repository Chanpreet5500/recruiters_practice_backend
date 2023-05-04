import { model, Schema } from 'mongoose'
const UserPostsSchema = new Schema({
    user_id: {
        type: Number,
        alias: 'userId',
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

export const UserPosts = model('user_posts', UserPostsSchema)