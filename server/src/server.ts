import express from "express"
import cors from 'cors'
import bodyParser from "body-parser"
import { PrismaClient } from "@prisma/client"
import { ServerError } from "@/bindings/server"
import { isMatching, P } from "ts-pattern"
import ClientMessage from "@/bindings/client"

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(bodyParser.json())

app.post('/auth/register', async (req, res) => {
    let request = req.body as ClientMessage
    let err : ServerError;
    if (!isMatching({username: P.string, password: P.string}, request)) {
        err = {errorMessage: "Haven't recieved the right input"}
        res.status(400).send(err)
    }
    console.log(req.body)
})

const server = app.listen(5000)