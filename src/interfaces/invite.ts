import {IBaseSchema} from './'
export interface IInvite extends IBaseSchema  {
    candidateId: string
    jobId: string
    inviteId: string 
}
