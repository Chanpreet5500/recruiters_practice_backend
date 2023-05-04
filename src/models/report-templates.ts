import { model, Schema, Document } from 'mongoose'
import { IReportTemplate} from '../interfaces'

type ReportTemplateType = IReportTemplate & Document;
const ReportTemplateSchema = new Schema({
    report_name: {
        type: String,
        alias: 'reportName',
    },
    report_data: {
        type: String,
    },
    variables: {
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

export const ReportTemplate = model<ReportTemplateType>('report_templates', ReportTemplateSchema)