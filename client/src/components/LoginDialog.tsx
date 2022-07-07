import { Dialog, DialogContent, DialogTitle, Stack, TextField, Button, DialogActions } from "@mui/material"
import React, { useState } from "react"
import { jwt } from "@/states"
import { useNavigate } from "react-router-dom"
import { isMatching, P } from "ts-pattern"
import ServerMessage, { intoResultAsync, throwIfError } from "@/bindings/server"
import { AuthData } from "@/bindings/client"
import Cookies from "js-cookie"
import ky from "ky"

const loginPath = import.meta.env.VITE_SERVER_URL + '/auth/login'

interface LoginDialogProps {
    isOpen: boolean
    onClose: () => void
}

const LoginDialog : React.FC<LoginDialogProps> = ({isOpen, onClose}) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    let navigate = useNavigate()

    async function unsafeLogin (loginData: AuthData) {
        return await ky.post(loginPath, {json: loginData}).json<ServerMessage>()
    }

    async function submitLogin() {
        if (username == "" || password == "") return

        const loginResult = await intoResultAsync(async () => await unsafeLogin({username, password}))
        if (!loginResult.ok || !isMatching({token: P.string}, loginResult.value)) return

        Cookies.set('jwt', loginResult.value.token, {expires: loginResult.value.age})
        navigate('/dashboard', {replace: true})
        jwt.token = loginResult.value.token
    }

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Login Form</DialogTitle>
            <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField onChange={(event) => setUsername(event.target.value)} required type='text' label='Username'/>
                        <TextField onChange={(event) => setPassword(event.target.value)} required type='password' label='Password'/>
                    </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    submitLogin()
                    onClose()
                }} variant="contained">Submit</Button>
            </DialogActions>
        </Dialog>
    )
}

export default LoginDialog