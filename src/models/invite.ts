import { Schema, model } from 'mongoose'

const InviteSchema = new Schema({
    candidateId : {
        type: Schema.Types.ObjectId,
        ref: 'user',
    }, 

    jobId : {
        type: Schema.Types.ObjectId,
        ref: 'jobs'
    }
    ,
    inviteId : {
        type : String,
        required : true
    },
    clientId : {
        type : Schema.Types.ObjectId,
        ref : 'user'
    }
})

export const Invite = model('invite', InviteSchema)