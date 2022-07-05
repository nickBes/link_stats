import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import App from './App'
import Login from './views/Login'
import Register from  './views/Register'
import Stats from './views/Stats'
import Dashboard from './views/Dashboard'
import "@/styles/global.scss"

const Main : React.FC = () => {
    return (
        <React.StrictMode>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App/>}>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                        <Route path="/dashboard/stats">
                            <Route path=":id" element={<Stats/>}/>
                        </Route>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </React.StrictMode>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Main/>)