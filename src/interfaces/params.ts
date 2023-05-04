import { IBaseSchema } from './'
export interface IParams extends IBaseSchema {
    id: string
    name: string
    description: string
    user_id: string,
    language: string
}
