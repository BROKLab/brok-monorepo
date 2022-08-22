import dynamic from "next/dynamic"
import React, { ReactNode } from "react"
type Props = { children: ReactNode }
const NoSSR: React.FC<Props> = (props) => (
    <React.Fragment>{props.children}</React.Fragment>
)
export default dynamic(() => Promise.resolve(NoSSR), {
    ssr: false
})