import { model, Schema, Document } from 'mongoose'
import { IUser } from '../interfaces'
type UserType = IUser & Document;
const UserSchema = new Schema({
    user_role_id: {
        type: Schema.Types.ObjectId,
        ref: 'UserRoles',
        required: true,
        alias: 'userRoleId',
    },
    candidate_client_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    first_name: {
        type: String,
        alias: 'firstName',
    },
    last_name: {
        type: String ,
        alias: 'lastName',
    },
    username: {
        type: String, 
    },
    email: {
        type: String, 
        unique: true,
    },
    phone: {
        type: String,
        required : true,
    },
    password: {
        type: String,
    },
    ein: {
        type: String,
    },
    company_name: {
        type: String,
    },
    company_number: {
        type: String,
    },
    company_phone_number: {
        type: String,
    },
    street_address: {
        type: String,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
    },
    preferredLanguage: {
        type: String,
    },
    zip_code: {
        type: String,
    },
    profession: {
        type: String,
    },
    education: {
        type: String,
    },
    experience: {
        type: String,
    },
    pass_obj: {
        type: Object,
        alias: 'passObj'
    },
    login_token: {
        type: String,
        alias: 'loginToken'
    },
    forgot_token: {
        type: String,
        alias: 'forgotToken'
    },
    forgot_token_exp: {
        type: Date,
        alias: 'forgotTokenExp'
    },
    verification_token: {
        type: String,
        alias: 'verificationToken'
    },
    last_login: {
        type: String,
        alias: 'lastLogin'
    },
    jobs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'jobs'
        }
    ],
    total_tests: {
        type: Number,
        default: 1
    },
    status: {
        type: Number,
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
export const User = model<UserType>('user', UserSchema)