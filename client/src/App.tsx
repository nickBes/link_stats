import React from "react"
import { useSnapshot } from "valtio"
import { jwt, links } from "./states"
import { Link, Outlet } from "react-router-dom"
import Cookies from "js-cookie"
import { Button, Typography, Stack, Box } from "@mui/material"
import { Dashboard, Login as LoginIcon, Logout, GitHub } from "@mui/icons-material"

const App : React.FC = () => {
    const jwtState = useSnapshot(jwt)

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
                        <Button><Link to="/register">Register</Link></Button>
                        <Button endIcon={<LoginIcon/>}><Link to="/login">Login</Link></Button>
                    </>}
                </Stack>
                <Box flexGrow={1} width="100%">
                    <Outlet/>
                </Box>
                <Box>
                    <Typography>Please Contribute</Typography>
                    <GitHub/>
                </Box>
            </Stack>
        </>
    )
}

export default App