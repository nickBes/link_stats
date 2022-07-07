import React, { useEffect, useState } from "react"
import { jwt, links } from "@/states"
import { useSnapshot } from "valtio"
import { isMatching, P } from "ts-pattern"
import ServerMessage from "@/bindings/server"
import ky from "ky"
import { DeleteLink } from "@/bindings/client"
import { Link } from "react-router-dom"
import TextTruncate from "react-text-truncate"
import { Delete } from "@mui/icons-material"
import { Divider, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material"
import { Container } from "@mui/system"
import CreateLink from "./CreateLink"

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
        <Container>
            <List>
                <CreateLink/>
                <Divider/>
                {[...linkState].map(([id, url]) => {
                    return (
                        <ListItem disablePadding key={id} secondaryAction={
                            <IconButton onClick={() => deleteLink(id)}>
                                <Delete/>
                            </IconButton>
                        }>
                            <ListItemButton>
                                <Link to={"/dashboard/stats/" + id}>
                                    <ListItemText><TextTruncate text={url}/></ListItemText>
                                </Link>
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </Container>
    )
}

export default Links