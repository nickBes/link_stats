import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Cookies from 'js-cookie'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { jwt } from './states'
import App from './App'
import Login from './views/Login'
import Register from  './views/Register'

const Main : React.FC = () => {
    useEffect(() => {
        let cookieJwt = Cookies.get('jwt')
        if (cookieJwt != undefined) {
            jwt.token = cookieJwt
        }
    }, [])

    return (
        <React.StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App/>}>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </React.StrictMode>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Main/>)