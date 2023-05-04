import {IBaseSchema} from './'
export interface IJob extends IBaseSchema  {
    _id: string
    name: string   
    type?: string
    education?: string
    city?: string
    country?: string
    job_id?: string
    client_id?: string
    candidates?: any
    parameters?: any[]
}
