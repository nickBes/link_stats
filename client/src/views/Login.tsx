import React, { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { AuthData } from "@/bindings/client"
import ServerMessage, { JWT, throwIfError } from "@/bindings/server"
import ky from "ky"
import { isMatching, P } from "ts-pattern"

const loginPath = import.meta.env.VITE_SERVER_URL + '/auth/login'

const Login : React.FC = () => {
    const form = useRef<HTMLFormElement | null>(null)
    const [logged, setLogged] = useState<boolean>(false)

    useEffect(() => {
        async function login (event: SubmitEvent) {
            event.preventDefault()

            if (form.current != null) {
                let data = new FormData(form.current)
                let username = data.get('username')
                let password = data.get('password')

                if (typeof username == 'string' && typeof password == 'string') {
                    let loginData : AuthData = {username, password}
                    let serverMessage = await ky.post(loginPath, {json: loginData}).json<ServerMessage>()

                    let safeMessage = throwIfError(serverMessage)
            
                    if (isMatching({token: P.string}, safeMessage)) { // then we recieved data of type JWT
                        setLogged(true)
                        Cookies.set('jwt', safeMessage.token, {expires: safeMessage.age})
                    } else {
                        throw `Recieved unexpected message from the server: ${safeMessage}`
                    }
                }
            }
        }

        form.current?.addEventListener('submit', login)
        return () => form.current?.removeEventListener('submit', login)
    })

    return (
        <>
            <p>This is the login page</p>
            <form ref={form}>
                <input type='text' name='username' placeholder='username'/>
                <input type='password' name='password' placeholder='password'/>
                <button type='submit'>Submit</button>
            </form>
            <p>{logged && 'logged successfuly'}</p>
        </>
    )
}

export default Login