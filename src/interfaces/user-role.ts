import {IBaseSchema} from './'
export interface IUserRole extends IBaseSchema {
    _id: string
    roleName: string
    description?: string
}