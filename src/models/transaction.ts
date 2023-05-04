import { model, Schema, Document } from 'mongoose'
import { ITransaction} from '../interfaces'

type TransactionType = ITransaction & Document;
const TransactionSchema = new Schema({
    session_id: {
        type: String,
        alias: 'sessionId',
    },
    status: {
        type: String,
    },
    total_amount: {
        type: Number,
    },
    tests_purchased: {
        type: Number,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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

export const Transaction = model<TransactionType>('transaction', TransactionSchema)