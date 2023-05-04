import {IBaseSchema} from './'
export interface IReportTemplate extends IBaseSchema {
    _id: string
    reportName: string
    report_data?: string
    variables?: string
}