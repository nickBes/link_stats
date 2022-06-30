import express, { Request, RequestHandler, Response } from "express"
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from "body-parser"
import { PrismaClient } from "@prisma/client"
import ServerMessage, { CreatedLink, intoResultAsync, JWT, ServerError } from "../bindings/server"
import { isMatching, P } from "ts-pattern"
import ClientMessage from "../bindings/client"

const prisma = new PrismaClient()
const app = express()

const JWT_MAX_AGE_DAYS = 1
const JWT_MAX_AGE_SECONDS = 60 * 60 * 24 * JWT_MAX_AGE_DAYS

app.use(cors())
app.use(bodyParser.json())

interface ClientRequest extends Request {
    body: ClientMessage
}

function generateJWT(id:number) : JWT {
    // we're checking whether the secret exists before starting express, hence we can cast it into string
    let token = jwt.sign({id}, process.env.JWT_SECRET as string, {expiresIn: JWT_MAX_AGE_SECONDS})
    return {token, age: JWT_MAX_AGE_DAYS}
}

async function urlExists (url: string): Promise<boolean> {
    let res = await fetch(url)
    return res.status == 200
}

app.post('/auth/login', async (req : ClientRequest, res) => {
    let err : ServerError

    if (!isMatching({username: P.string, password: P.string}, req.body)) {
        err = {errorMessage: "Haven't recieved the right input"}
        res.send(err)
        return
    }

    err = {errorMessage: 'Incorrect username or password'}
    let existingUser = await prisma.user.findUnique({where: {name: req.body.username}})
    if (existingUser == null) { // then user doesn't exist
        res.send(err)
        return
    }

    let passwordMatches = await bcrypt.compare(req.body.password, existingUser.password)
    if (passwordMatches == false) { // then password don't match
        res.send(err)
        return
    }

    // user exists and password matches hence can generate a jwt
    res.send(generateJWT(existingUser.id))
})

app.post('/auth/register', async (req: ClientRequest, res) => {
    let err : ServerError

    if (!isMatching({username: P.string, password: P.string}, req.body)) {
        err = {errorMessage: "Haven't recieved the right input"}
        res.send(err)
        return
    }

    let existingUser = await prisma.user.findUnique({where: {name: req.body.username}})
    if (existingUser != null) { // then user already exists
        err = {errorMessage: `Username ${req.body.username} already exists`}
        res.send(err)
        return
    }

    // generate hash of the password with one salt round
    let hashedPassword = await bcrypt.hash(req.body.password, 1)

    // save new user and update the client with the id + jwt token
    let user = await prisma.user.create({data: {name: req.body.username, password: hashedPassword}})
    res.send(generateJWT(user.id))
})

interface AuthorizedRequest extends ClientRequest {
    userId?: number
}

const authHandler : RequestHandler = async (req: AuthorizedRequest, res, next) => {
    let token = req.headers.authorization
    let err: ServerError = {errorMessage: "Authorization token isn't passed"}
    if (token == undefined) {
        res.send(err).end()
        return
    }
    try {
        // before we start express we check if the secret is undefined, so we're allowed to cast it into string
        let decoded : any = jwt.verify(token, process.env.JWT_SECRET as string)
        if (!isMatching({id: P.number}, decoded)) {
            err.errorMessage = "Couldn't find user id inside the autorization token"
            res.send(err).end()
            return
        }

        // this means that the user id will be passed through the request only
        // if all of the conditions are met
        req.userId = decoded.id
        next()
    } catch (e) {
        err.errorMessage = `Coulden't verify authorization token with error: ${e}`
        res.send(err).end()
        return
    }
}

app.post('/link/create', authHandler , async (req: AuthorizedRequest, res) => {
    // auth handler makes sure to call this function after user ID is defined
    // so we can force a cast on it
    let userId = req.userId as number
    let err: ServerError

    if (!isMatching({url: P.string}, req.body)) {
        err = {errorMessage: "Haven't recieved the right format for creating a new link"}
        res.send(err).end()
        return
    }

    let isValidUrl = await urlExists(req.body.url)
    if (!isValidUrl) {
        err = {errorMessage: "The given URL isn't valid"}
        res.send(err).end()
        return
    }
    let url = req.body.url

    let urlResult = await intoResultAsync(async () => await prisma.link.create({data: {url, ownerId: userId}}))

    if (!urlResult.ok) {
        err = {errorMessage: `Couldn't create link with error: ${urlResult.error}`}
        res.send(err).end()
        return
    }

    let createdLink : CreatedLink = {id: urlResult.value.id, url}
    // test
    res.send(createdLink)
})

app.get('/link/all/', authHandler, async (req: AuthorizedRequest, res: Response<ServerMessage>) => {
    let userId = req.userId as number
    let allLinksResult = await intoResultAsync(async () => await prisma.link.findMany({where: {ownerId: userId}}))
    if(!allLinksResult.ok) {
        let err : ServerError  = {errorMessage: `Couldn't fetch all links with error: ${allLinksResult.error}`}
        res.send(err).end()
        return
    }

    res.send({links: allLinksResult.value.map(link => {
        let parsedLink : CreatedLink = {url: link.url, id: link.id}
        return parsedLink
    })}).end()
})

app.get('/link/visit/:linkId', async (req: Request<{linkId: string}>, res) => {
    if(!isMatching({linkId: P.string}, req.params)) {
        res.sendStatus(404).end()
        return
    }

    let id = parseInt(req.params.linkId) // then haven't recieved a number
    if (isNaN(id)) {
        res.sendStatus(404).end()
        return
    }

    let urlResult = await intoResultAsync(async () => await prisma.link.findUnique({where: {id}}))
    if (!urlResult.ok || urlResult.value == null) {
        res.sendStatus(404).end()
        return
    }

    res.redirect(urlResult.value.url)
})

if (process.env.JWT_SECRET != undefined) {
    app.listen(5000)
} else {
    console.error('no jwt token secret defined')
}