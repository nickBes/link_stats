import React, { useEffect } from "react"
import { useSnapshot } from "valtio"
import { jwt } from "@/states"
import { useNavigate } from "react-router-dom"
import { subscribeKey } from "valtio/utils"

interface AuthProps {
    children: JSX.Element
}
const Auth : React.FC<AuthProps> = ({children}) => {
    let navigate = useNavigate()
    const jwtState = useSnapshot(jwt)

    useEffect(() => {
        function homeWhenNotAuthorized(token: string | null) {
            if (token == null) {
                navigate("/", {replace: true})
            }
        }

        homeWhenNotAuthorized(jwtState.token)
        let unsub = subscribeKey(jwt, "token", (t) => {
            homeWhenNotAuthorized(t)
        })

        return () => unsub()
    }, [])



    return (
        <>{jwtState.token != null && children}</>
    )
}

export default Auth