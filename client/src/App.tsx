import React, { useState } from "react"
import { useSnapshot } from "valtio"
import { jwt, links } from "./states"
import { Link, Outlet } from "react-router-dom"
import Cookies from "js-cookie"
import { Button, Typography, Stack, Box, Divider } from "@mui/material"
import { Dashboard, Login as LoginIcon, Logout, GitHub } from "@mui/icons-material"
import LoginDialog from "./components/LoginDialog"
import RegisterDialog from "./components/RegisterDialog"


const App : React.FC = () => {
    const jwtState = useSnapshot(jwt)
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)

    function logout() {
        Cookies.remove('jwt')
        jwt.token = null
        links.clear()
    }

    return (
        <>
            <Stack alignItems="center" spacing={1} height="100vh">
                <Link to="/">
                    <Typography sx={{fontWeight: "bold", fontSize: {xs: "2rem", md: "3rem"}}}>LinkStats</Typography>
                </Link>
                <Stack alignItems="center" direction="row" spacing={2}>
                    {jwtState.token ? 
                    <>
                        <Button endIcon={<Dashboard/>}><Link to="/dashboard">Dashboard</Link></Button>
                        <Button endIcon={<Logout/>} color="error" onClick={logout}>LogOut</Button>
                    </> :
                    <>
                        <Button onClick={() => setIsRegisterDialogOpen(true)}>Register</Button>
                        <Button endIcon={<LoginIcon/>} onClick={() => setIsLoginDialogOpen(true)}>Login</Button>
                    </>}
                </Stack>
                <Box flexGrow={1} width="100%">
                    <Outlet/>
                </Box>
                <Box>
                    <Typography>Please Contribute</Typography>
                    <GitHub/>
                </Box>
                {jwtState.token == null && 
                <>
                    <LoginDialog onClose={() => setIsLoginDialogOpen(false)} isOpen={isLoginDialogOpen}/>
                    <RegisterDialog onClose={() => setIsRegisterDialogOpen(false)} isOpen={isRegisterDialogOpen}/>
                </>}
            </Stack>
        </>
    )
}

export default App