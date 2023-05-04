export interface ISuccessResponse {
    message?: string
    data?: Record<string, unknown>
    success: boolean
}

export interface IBaseSchema {
    dateCreated: Date,
    dateUpdated: Date,
    isDeleted: number,
}