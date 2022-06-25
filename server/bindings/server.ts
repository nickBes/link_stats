import { isMatching, P } from "ts-pattern"

export interface Registered {
    registeredUserId: number
}

export interface ServerError {
    errorMessage: string
}

type ServerMessage = Registered | ServerError

export default ServerMessage

export function throwIfError (serverMessage : ServerMessage) {
    if (isMatching({errorMessage: P.string}, serverMessage)) { // then error was detected
        throw serverMessage.errorMessage
    }
    // here we infer that the server would always return messages from the ServerMessage type
    // hence if don't use otherwise from the ts-pattern library
    return serverMessage
}