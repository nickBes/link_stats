import express from "express"
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from "body-parser"
import { PrismaClient } from "@prisma/client"
import { JWT, ServerError } from "@/bindings/server"
import { isMatching, P } from "ts-pattern"
import ClientMessage from "@/bindings/client"

const prisma = new PrismaClient()
const app = express()

const JWT_MAX_AGE_DAYS = 1
const JWT_MAX_AGE_SECONDS = 60 * 60 * 24 * JWT_MAX_AGE_DAYS

app.use(cors())
app.use(bodyParser.json())

function generateJWT (id:number) : JWT {
    // we're checking whether the secret exists before starting express, hence we can cast it into string
    let token = jwt.sign({id}, process.env.JWT_SECRET as string, {expiresIn: JWT_MAX_AGE_SECONDS})
    return {token, age: JWT_MAX_AGE_DAYS}
}

app.post('/auth/login', async (req, res) => {
    let request = req.body as ClientMessage
    let err : ServerError

    if (!isMatching({username: P.string, password: P.string}, request)) {
        err = {errorMessage: "Haven't recieved the right input"}
        res.send(err)
        return
    }

    err = {errorMessage: 'Incorrect username or password'}
    let existingUser = await prisma.user.findUnique({where: {name: request.username}})
    if (existingUser == null) { // then user doesn't exist
        res.send(err)
        return
    }

    let passwordMatches = await bcrypt.compare(request.password, existingUser.password)
    if (passwordMatches == false) { // then password don't match
        res.send(err)
        return
    }

    // user exists and password matches hence can generate a jwt
    res.send(generateJWT(existingUser.id))
})

app.post('/auth/register', async (req, res) => {
    let request = req.body as ClientMessage
    let err : ServerError

    if (!isMatching({username: P.string, password: P.string}, request)) {
        err = {errorMessage: "Haven't recieved the right input"}
        res.send(err)
        return
    }

    let existingUser = await prisma.user.findUnique({where: {name: request.username}})
    if (existingUser != null) { // then user already exists
        err = {errorMessage: `Username ${request.username} already exists`}
        res.send(err)
        return
    }

    // generate hash of the password with one salt round
    let hashedPassword = await bcrypt.hash(request.password, 1)

    // save new user and update the client with the id + jwt token
    let user = await prisma.user.create({data: {name: request.username, password: hashedPassword}})
    res.send(generateJWT(user.id))
})

if (process.env.JWT_SECRET != undefined) {
    app.listen(5000)
} else {
    console.error('no jwt token secret defined')
}