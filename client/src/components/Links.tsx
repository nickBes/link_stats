import React, { useEffect } from "react"
import { jwt, links } from "@/states"
import { useSnapshot } from "valtio"
import { isMatching, P } from "ts-pattern"
import ServerMessage from "@/bindings/server"
import ky from "ky"

const fetchLinkPath = import.meta.env.VITE_SERVER_URL + '/link/all'

const Links : React.FC = () => {
    const jwtState = useSnapshot(jwt)
    const linkState = useSnapshot(links)

    useEffect(() => {
        if (jwtState.token == null) return
        
        async function fetchLinks() {
            let res = await ky.get(fetchLinkPath, {headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()
            if (!isMatching({links: P.array({url: P.string})}, res)) return
            links.clear()

            res.links.forEach(link => links.add(link))
        }

        fetchLinks()
    }, [])

    return (
    <ul>
        {[...linkState].map((link) => {
            return (
                <li key={link.id}>Number {link.id}:<br/> <a href={link.url}>{link.url}</a></li>
            )
        })}
    </ul>
    )
}

export default Links