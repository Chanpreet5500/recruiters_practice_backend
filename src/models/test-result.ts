import {model, Schema} from 'mongoose'

const TestResultSchema = new Schema ({
    testId : {
        type : String,
        required: true,
        unique : true
    },

    legibility : {
        type : String,
        required : true
    },

    proportionality_ratio : {
        type : String,
        required: true
    },

    pressure : {
        type : String,
        required: true
    },

    black_pixel_percentage : {
        type : String,
        required: true
    },

    letter_tilt : {
        type : String,
        required: true
    },

    line_slope : {
        type : String,
        required: true
    },

    seperation_between_the_letters : {
        type : String,
        required: true
    },

    seperation_between_the_words : {
        type : String,
        required: true
    },

    signature_legibility : {
        type : String,
        required: true
    },

    signature_position : {
        type : String,
        required: true
    },

    size : {
        type : String,
        required: true
    },

    size_regularity : {
        type : String,
        required: true
    },

    size_variability : {
        type : String,
        required: true
    },

    speed : {
        type : String,
        required: true
    },

    text_stability : {
        type : String,
        required: true
    },

})

export const TestResult = model('test_result', TestResultSchema)




