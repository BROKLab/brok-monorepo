import React, { useMemo, useState } from 'react';
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import dracula from 'prism-react-renderer/themes/dracula';
import { CopyDuplicate } from 'react-basicons'
import { Button, Container, NormalColors } from '@nextui-org/react';

interface Props {
    code: string
    lang: Language
}

enum CopyResult {
    DEFAULT,
    SUCCESS,
    ERROR
}

export const Code: React.FC<Props> = ({ ...props }) => {
    const [copyResult, setCopyResult] = useState<CopyResult>(CopyResult.DEFAULT);


    const copy = () => {
        try {
            navigator.clipboard.writeText(props.code);
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

    const buttonColor = useMemo((): NormalColors => {
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
        <Highlight {...defaultProps} theme={dracula} code={props.code} language="typescript">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre className={className} style={style}>
                    {tokens.map((line, i) => (
                        // eslint-disable-next-line react/jsx-key
                        <div {...getLineProps({ line, key: i })}>
                            {i === 0 && (
                                <div style={{ float: "right" }}><Button style={{ marginLeft: "1rem", minWidth: "3rem" }} size={"xs"} color={buttonColor} onPress={() => copy()} icon={<CopyDuplicate size={15} color='white'></CopyDuplicate>}></Button></div>
                            )}
                            {line.map((token, key) => (
                                // eslint-disable-next-line react/jsx-key
                                <span {...getTokenProps({ token, key })} />
                            ))}
                        </div>
                    ))}
                </pre>
            )}
        </Highlight>
    )
}