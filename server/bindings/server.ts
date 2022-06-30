import { isMatching, P } from "ts-pattern"

interface RawResult {
    ok: boolean
}

interface ResultError extends RawResult {
    ok: false,
    error: unknown
}

interface ResultValue<T> extends RawResult {
    ok: true,
    value: T
}

type Result <T> = ResultError | ResultValue<T>

function intoOk<T> (value: T) : ResultValue<T> {
    return {ok: true, value}
}

function intoError (error: unknown) : ResultError {
    return {ok: false, error}
}

type ThrowableCallback <T> = () => T | never

export function intoResult <T> (callback: ThrowableCallback<T>) : Result<T> {
    try {
        return intoOk(callback())
    } catch (error) {
        return intoError(error)
    }
}

type AsyncThrowableCallback <T> = () => Promise<T> | never

export async function intoResultAsync <T> (callback: AsyncThrowableCallback<T>) : Promise<Result<T>> {
    try {
        let value = await callback()
        return intoOk(value)
    } catch (error) {
        return intoError(error)
    }
}

export interface ServerError {
    errorMessage: string
}

export interface JWT {
    token: string,
    // the age probably should be in .env, will do later
    age: number // in days
}

export interface CreatedLink {
    url: string,
    id: number
}

export interface FetchedLinks {
    links: CreatedLink[]
}

type ServerMessage = JWT | ServerError | CreatedLink | FetchedLinks

export function throwIfError (serverMessage : ServerMessage) {
    if (isMatching({errorMessage: P.string}, serverMessage)) { // then error was detected
        console.error(serverMessage.errorMessage) // for debug 
        throw serverMessage.errorMessage
    }
    // here we infer that the server would always return messages from the ServerMessage type
    // hence if don't use otherwise from the ts-pattern library
    return serverMessage
}

export default ServerMessage