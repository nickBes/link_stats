import React, { useEffect, useRef } from "react"
import Cookies from "js-cookie"
import { AuthData } from "@/bindings/client"
import ServerMessage, { throwIfError } from "@/bindings/server"
import ky from "ky"
import { useNavigate } from "react-router-dom"
import { isMatching, P } from "ts-pattern"
import { jwt } from "@/states"
import { useSnapshot } from "valtio"
import { Container } from "@mui/system"
import { Button, TextField, Stack, Card, CardContent, CardHeader, Typography } from "@mui/material"

const loginPath = import.meta.env.VITE_SERVER_URL + '/auth/login'

const Login : React.FC = () => {
    const form = useRef<HTMLFormElement | null>(null)
    let navigate = useNavigate()
    const jwtState = useSnapshot(jwt)

    useEffect(() => {
        if (jwtState.token != null) {
            navigate('/dashboard', {replace: true})
        }

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
                        Cookies.set('jwt', safeMessage.token, {expires: safeMessage.age})
                        navigate('/dashboard', {replace: true})
                        jwt.token = safeMessage.token
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
        <Container sx={{display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%"}}>
            <Card raised sx={{width: {xs: "75%", md: "45%"}}}>
                <CardHeader titleTypographyProps={{align: "center", sx: {fontWeight: "bold"}}} title="Login Form"/>
                <CardContent>
                    <form ref={form}>
                        <Stack spacing={2}>
                            <TextField required type='text' name='username' label='Username'/>
                            <TextField required type='password' name='password' label='Password'/>
                            <Button size="large" variant="contained" type='submit'>Submit</Button>
                        </Stack>
                    </form>
                </CardContent>

            </Card>
        </Container>
    )
}

export default Login