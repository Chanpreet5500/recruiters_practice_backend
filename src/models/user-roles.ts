import { model, Schema, Document } from 'mongoose'
import { IUserRole} from '../interfaces'

type UserRoleType = IUserRole & Document;
const UserRolesSchema = new Schema({
    role_name: {
        type: String,
        alias: 'roleName',
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

export const UserRoles = model<UserRoleType>('user_roles', UserRolesSchema)