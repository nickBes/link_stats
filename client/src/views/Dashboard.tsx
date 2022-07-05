import Auth from "@/components/Auth"
import CreateLink from "@/components/CreateLink"
import Links from "@/components/Links"
import React from "react"

const Dashboard : React.FC = () => {
    return (
        <Auth>
            <>
                <Links/>
            </>
        </Auth>
    )
}

export default Dashboard