import { Button, Container, NormalColors, Tooltip } from '@nextui-org/react';
import React, { useMemo, useState } from 'react';
import { CopyDuplicate } from 'react-basicons';

interface Props {
    text?: string
    children: React.ReactNode
}

enum CopyResult {
    DEFAULT,
    SUCCESS,
    ERROR
}

export const Copy: React.FC<Props> = ({ ...props }) => {
    const [copyResult, setCopyResult] = useState<CopyResult>(CopyResult.DEFAULT);


    const copy = () => {
        try {
            let copyContent = "";
            if (props.text) {
                copyContent = props.text
            } else if (typeof props.children === "string") {
                copyContent = props.children
            } else {
                throw new Error("No suitable copy content.")
            }
            navigator.clipboard.writeText(copyContent);
            console.log("Copied")
            setCopyResult(CopyResult.SUCCESS)
            setTimeout(() => {
                setCopyResult(CopyResult.DEFAULT)
            }, 500)
        } catch (error) {
            console.log("Error copy:", error)
            setCopyResult(CopyResult.ERROR)
            setTimeout(() => {
                setCopyResult(CopyResult.DEFAULT)
            }, 500)
        }
    }

    const buttonColor = useMemo(() => {
        switch (copyResult) {
            case CopyResult.SUCCESS:
                return "success"
            case CopyResult.ERROR:
                return "error"
            default:
                return "default";
        }
    }, [copyResult])

    return (
        <div style={{ overflow: "clip", marginRight: "1rem", textOverflow: "ellipsis" }} onClick={() => copy()}  >
            <Tooltip placement="topStart" content={copyResult === CopyResult.SUCCESS ? "Copied!" : "Click to Copy"} color={buttonColor} >
                {props.children}
            </Tooltip>
        </div>
    )
}