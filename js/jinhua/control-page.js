import { typeWriter_formatAnswer,changeQuestionText } from '../utils/typeWriter.js'

export function control_tts_show(text){
    changeQuestionText(text)
}

export function control_answer_show(text){
    typeWriter_formatAnswer(text)
}