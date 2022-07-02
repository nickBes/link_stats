import React, { useEffect } from "react"
import { jwt, links } from "@/states"
import { useSnapshot } from "valtio"
import { isMatching, P } from "ts-pattern"
import ServerMessage from "@/bindings/server"
import ky from "ky"
import { DeleteLink } from "@/bindings/client"
import { Link } from "react-router-dom"

const linkPath = import.meta.env.VITE_SERVER_URL + '/link/'

const Links : React.FC = () => {
    const jwtState = useSnapshot(jwt)
    const linkState = useSnapshot(links)

    useEffect(() => {
        if (jwtState.token == null) return

        async function fetchLinks() {
            
            let res = await ky.get(linkPath + 'all', {headers: {Authorization: jwtState.token as string}}).json<ServerMessage>()
            if (!isMatching({links: P.array({url: P.string})}, res)) return
            links.clear()

            res.links.forEach(link => links.set(link.id, link.url))
        }

        fetchLinks()
    }, [])

    async function deleteLink(id:number) {
        if (jwtState.token == null) return

        let deleteLinkReq : DeleteLink = {linkId: id}
        let res = await ky.delete(linkPath, {
                                                json: deleteLinkReq,
                                                headers: {Authorization: jwtState.token}
                                            })
                                            .json<ServerMessage>()

        if (!isMatching({url: P.string}, res)) return
        links.delete(id)
    }

    return (
    <ul>
        {[...linkState].map(([id, url]) => {
            return (
                <li key={id}>
                    <p>Number {id}:</p><br/>
                    <a href={linkPath + id}>{url}</a><br/>
                    <Link to={"/dashboard/stats/" + id}>Stats</Link><br/>                  
                    <button onClick={() => deleteLink(id)}>delete</button>
                </li>
            )
        })}
    </ul>
    )
}

export default Links