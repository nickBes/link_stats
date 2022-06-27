import React from "react"
import { useSnapshot } from "valtio"
import { jwt } from "./states"
import { Link, Outlet } from "react-router-dom"
import Cookies from "js-cookie"

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
            </nav>
            <Outlet/>
        </>
    )
}

export default App