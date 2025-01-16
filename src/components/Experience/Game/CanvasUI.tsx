import { Container, Fullscreen, Text as TextUI } from "@react-three/uikit";
import { isHost, myPlayer, useMultiplayerState } from "playroomkit";
import { useEffect, useState } from "react";
import usePlayers from "./../helpers/usePlayers";

const CanvasUI = () => {

    const [isRestart, setIsRestart] = useState(false)
    const [, setStatus] = useMultiplayerState<number>('status', 0);
    const { amISeeker } = usePlayers()

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
            <Container positionType={"absolute"} positionBottom={0} positionLeft={0} padding={0} paddingTop={50} paddingRight={80} backgroundColor={"#606060"} transformRotateZ={-35} width={"80%"} height={"60%"} flexDirection={"column"} justifyContent={"flex-start"} alignItems={"center"} transformTranslateX={"-40%"} transformTranslateY={"55%"}>
                <TextUI fontWeight={700} color={"white"} fontSize={25}>You are:</TextUI>
                <TextUI color={!myPlayer().getState("isAlive") || !amISeeker ? "green" : "#FF0004"} fontSize={50} fontWeight={700} opacity={.9}>
                    {!myPlayer().getState("isAlive") ? "Dead." : amISeeker ? "Seeker" : "Hider"}
                </TextUI>
                {/* <div className="rotate-[35deg] absolute sm:w-[30%] w-[20%] sm:bottom-[110px] bottom-[50%] sm:right-[150px] right-[40%]">
                    {seeker === user?.email ? <img src={botLogo} alt="" /> : <img src={hiderLogo} />}
                </div> */}
            </Container>
        </Fullscreen>
    )
}

export default CanvasUI