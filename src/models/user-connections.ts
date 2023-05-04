import { model, Schema } from 'mongoose'

const UserConnectionsSchema = new Schema({
    user_id: {
        type: Number,
    },
    user_networks: {
        type: String,
        alias: 'userNetworks'
    },
    pending_requests: {
        type: String,
        alias: 'pendingRequests'
    },
    sent_requests: {
        type: String,
        alias: 'sentRequests'
    },
    user_followers: {
        type: String,
        alias: 'userFollowers'
    },
    user_block_list: {
        type: String,
        alias: 'userBlockList',
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

export const UserConnections = model('user_connections', UserConnectionsSchema)