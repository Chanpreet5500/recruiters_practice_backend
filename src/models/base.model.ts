/**
 * @description Base class model
 */
export default class BaseModel  {

    public id!: number // Note that the `null assertion` `!` is required in strict mode.
    public readonly date_created!: Date
    public readonly date_updated!: Date
}

