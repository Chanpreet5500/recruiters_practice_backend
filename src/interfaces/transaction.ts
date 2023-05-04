import {IBaseSchema} from './'
export interface ITransaction extends IBaseSchema {
    _id: string
    sessionId: string
    status?: string
    total_amount?: string
    tests_purchased?: number
    user_id: Record<string, unknown>
}