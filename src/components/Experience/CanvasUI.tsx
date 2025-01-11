import { Container, Fullscreen, Text as TextUI } from "@react-three/uikit";
import { isHost, useMultiplayerState } from "playroomkit";
import { useEffect, useState } from "react";

const CanvasUI = () => {

    const [isRestart, setIsRestart] = useState(false)
    const [, setStatus] = useMultiplayerState<number>('status', 0);

    /**
     * Handle the key press event
     * Set the recipient as seeker for the hiders
     */
    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "KeyM") {
                e.preventDefault()
                setIsRestart((prev) => !prev)
            }
        }

        if (isHost()) {
            window.addEventListener("keydown", handleKeyDown)
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isRestart])

    return (
        <Fullscreen>
            {isRestart && isHost() &&
                <Container
                    positionType="absolute"
                    positionBottom={0}
                    positionLeft={0}
                    backgroundColor={"gray"}
                    backgroundOpacity={.9}
                    flexDirection={'column'}
                    gap={5}
                    padding={20}
                >
                    <TextUI
                        onClick={(e) => {
                            e.stopPropagation()
                            setStatus(4, true)
                        }}
                        fontSize={24}
                        backgroundColor={"white"}
                        paddingY={10}
                        paddingX={20}
                        borderRadius={10}
                        borderWidth={5}
                        borderColor={"red"}
                    >
                        Restart game
                    </TextUI>
                </Container>}
        </Fullscreen>
    )
}

export default CanvasUI