import { isMatching, P } from "ts-pattern"

export interface JWT {
    token: string,
    // the age probably should be in .env, will do later
    age: number // in days
}

export interface ServerError {
    errorMessage: string
}

type ServerMessage = JWT | ServerError

export default ServerMessage

export function throwIfError (serverMessage : ServerMessage) {
    if (isMatching({errorMessage: P.string}, serverMessage)) { // then error was detected
        console.error(serverMessage.errorMessage) // for debug 
        throw serverMessage.errorMessage
    }
    // here we infer that the server would always return messages from the ServerMessage type
    // hence if don't use otherwise from the ts-pattern library
    return serverMessage
}