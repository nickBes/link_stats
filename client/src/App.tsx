import React from "react"
import { useSnapshot } from "valtio"
import { jwt } from "./states"
import { Link, Outlet } from "react-router-dom"
import ServerMessage from "@/bindings/server"
import Cookies from "js-cookie"
import ky from "ky"

const createLinkPath = import.meta.env.VITE_SERVER_URL + '/link/create'

const App : React.FC = () => {
    const jwtState = useSnapshot(jwt)

    function logout() {
        Cookies.remove('jwt')
        jwt.token = null
    }

    async function createUrl() {
        // test
        let serverMessage = await ky.post(createLinkPath, {json: {url: 'https://favory.xyz'}, headers: {Authorization: jwt.token as string}}).json<ServerMessage>()
        console.log(serverMessage)
    }

    return (
        <>
            <p>Hello World!</p>
            <nav style={{display: 'flex', flexDirection: 'column'}}>
                {jwtState.token ? <button onClick={logout}>logout</button> :  <>
                    <Link to='/login'>Login</Link>
                    <Link to='/register'>Register</Link>
                </>}

                <button onClick={createUrl}>create url</button>
            </nav>
            <Outlet/>
        </>
    )
}

export default App