import React from "react"
import { Link, Outlet } from "react-router-dom"

const App : React.FC = () => {
    return (
        <>
            <p>Hello World!</p>
            <nav style={{display: 'flex', flexDirection: 'column'}}>
                <Link to='/login'>Login</Link>
                <Link to='/register'>Register</Link>
            </nav>
            <Outlet/>
        </>
    )
}

export default App