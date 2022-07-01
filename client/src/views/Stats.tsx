import React from "react"
import { useParams } from "react-router"
import { isMatching, P } from "ts-pattern"

const Stats : React.FC = () => {
    const params = useParams()

    console.log(isMatching({id: P.string}, params))
    return (
        <></>
    )
}

export default Stats