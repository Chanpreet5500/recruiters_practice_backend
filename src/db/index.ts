import mongoose from 'mongoose'
import logger from '@utilities/logger'
/**
 * @description DB connection 
 */
class Connection {
    public sequelize: any
    constructor() {
        this.config()
    }
    public async config(): Promise<any> {
        const connectURL = process.env.DB_USERNAME ? `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}` : `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`
        mongoose.connect(connectURL, (err) => {
            mongoose.set('debug', true)
            console.log(err)

            if (err) { logger.info('Unable to connect to the mongo database:', err) } else {
                logger.info('Mongo DB Connection has been established successfully.')
            }
        })
    }
}
export default new Connection()
