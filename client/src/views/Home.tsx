import { Card, CardHeader, CardMedia, Container, Typography } from "@mui/material"
import React from "react"
import BlueBackground from "@/static/blue.jpg"

const Home : React.FC = () => {
    return (
        <Container>
            <Card variant="outlined">
                <CardHeader title="Create wrappers over URLs" subheader="Simply register and create new URLs which you can share and analyze"/>
                <CardMedia component="img" sx={{height: {xs: "50vh", md: "25vh"}}} src={BlueBackground}/>
            </Card>
        </Container>
    )
}

export default Home