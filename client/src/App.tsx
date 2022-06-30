import React from "react"
import { useSnapshot } from "valtio"
import { jwt } from "./states"
import { Link, Outlet } from "react-router-dom"
import Cookies from "js-cookie"
import CreateLink from "./components/CreateLink"

const App : React.FC = () => {
    const jwtState = useSnapshot(jwt)

    function logout() {
        Cookies.remove('jwt')
        jwt.token = null
    }

    return (
        <>
            <p>Hello World!</p>
            <nav style={{display: 'flex', flexDirection: 'column'}}>
                {jwtState.token ? <button onClick={logout}>logout</button> :  <>
                    <Link to='/login'>Login</Link>
                    <Link to='/register'>Register</Link>
                </>}

                {jwt.token != null && <CreateLink/>}
            </nav>
            <Outlet/>
        </>
    )
}

export default App