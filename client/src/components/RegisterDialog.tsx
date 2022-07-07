import { Dialog, DialogContent, DialogTitle, Stack, TextField, Button, DialogActions } from "@mui/material"
import React, { useState } from "react"
import { jwt } from "@/states"
import { useNavigate } from "react-router-dom"
import { isMatching, P } from "ts-pattern"
import ServerMessage, { intoResultAsync, throwIfError } from "@/bindings/server"
import { AuthData } from "@/bindings/client"
import Cookies from "js-cookie"
import ky from "ky"

const registrationPath = import.meta.env.VITE_SERVER_URL + '/auth/register'

interface LoginDialogProps {
    isOpen: boolean
    onClose: () => void
}

const RegisterDialog : React.FC<LoginDialogProps> = ({isOpen, onClose}) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    let navigate = useNavigate()

    async function unsafeRegistration (registerData: AuthData) {
        return await ky.post(registrationPath, {json: registerData}).json<ServerMessage>()
    }

    async function submitLogin() {
        if (username == "" || password == "") return

        const registerResult = await intoResultAsync(async () => await unsafeRegistration({username, password}))
        if (!registerResult.ok || !isMatching({token: P.string}, registerResult.value)) return

        Cookies.set('jwt', registerResult.value.token, {expires: registerResult.value.age})
        navigate('/dashboard', {replace: true})
        jwt.token = registerResult.value.token
    }

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Register Form</DialogTitle>
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

export default RegisterDialog