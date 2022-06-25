import React, { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { AuthData } from "@/bindings/client"
import ServerMessage, { JWT, throwIfError } from "@/bindings/server"
import ky from "ky"
import { isMatching, P } from "ts-pattern"

const registrationPath = import.meta.env.VITE_SERVER_URL + '/auth/register'

const Register : React.FC = () => {
    const form = useRef<HTMLFormElement | null>(null)
    const [registered, setRegistered] = useState<JWT | null>(null)

    useEffect(() => {
        async function register (event: SubmitEvent) {
            event.preventDefault()

            if (form.current != null) {
                let data = new FormData(form.current)
                let username = data.get('username')
                let password = data.get('password')

                if (typeof username == 'string' && typeof password == 'string') {
                    let registrationData : AuthData = {username, password}
                    let serverMessage = await ky.post(registrationPath, {json: registrationData}).json<ServerMessage>()

                    let safeMessage = throwIfError(serverMessage)
            
                    if (isMatching({token: P.string}, safeMessage)) { // then we recieved data of type JWT
                        setRegistered(safeMessage)
                        Cookies.set('jwt', safeMessage.token, {expires: safeMessage.age})
                    } else {
                        throw `Recieved unexpected message from the server: ${safeMessage}`
                    }
                }
            }
        }

        form.current?.addEventListener('submit', register)
        return () => form.current?.removeEventListener('submit', register)
    })

    return (
        <>
            <p>This is the register page</p>
            <form ref={form}>
                <input type='text' name='username' placeholder='username'/>
                <input type='password' name='password' placeholder='password'/>
                <button type='submit'>Submit</button>
            </form>
            <p>{registered && 'registered successfuly'}</p>
        </>
    )
}

export default Register