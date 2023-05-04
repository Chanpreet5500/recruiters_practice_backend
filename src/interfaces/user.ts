import {IBaseSchema} from './'
export interface IUser extends IBaseSchema  {
    _id: string
    userRoleId: Record<string, unknown>
    subscriptionId?: number
    firstName?: string
    lastName?: string
    username: string
    email: string
    street_address: string
    company_name: string
    company_number: string
    city: string
    country: string
    preferredLanguage: string
    zip_code: string
    profession: string
    education: string
    ein: string
    experience: string
    phone: string
    password: string
    total_tests: number
    loginToken?: string
    forgotToken?: string
    verificationToken?: string
    lastLogin?: string
    status: number
    passObj: any
    jobs?: any
}