import React from "react"
import { useSnapshot } from "valtio"
import { jwt, links } from "./states"
import { Link, Outlet } from "react-router-dom"
import Cookies from "js-cookie"
import CreateLink from "./components/CreateLink"
import Links from "./components/Links"

const App : React.FC = () => {
    const jwtState = useSnapshot(jwt)
    const linkState = useSnapshot(links)

    function logout() {
        Cookies.remove('jwt')
        jwt.token = null
        links.clear()
    }

    return (
        <>
            <p>Hello World!</p>
            <nav style={{display: 'flex', flexDirection: 'column'}}>
                {jwtState.token ? <button onClick={logout}>logout</button> :  <>
                    <Link to='/login'>Login</Link>
                    <Link to='/register'>Register</Link>
                </>}

                {jwt.token != null && <Links/>}

                {jwt.token != null && <CreateLink/>}
            </nav>
            <Outlet/>
        </>
    )
}

export default App