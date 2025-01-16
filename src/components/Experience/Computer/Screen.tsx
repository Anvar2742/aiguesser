import { useEffect, useRef } from "react";
import usePlayers from "../helpers/usePlayers";
import { Root, Container } from "@react-three/uikit";
import Chat from "./Chat";
import { PlayerState } from "playroomkit";
import { Group as ThreeGroup } from 'three';
import useCameraAnimation from "../helpers/useCameraAnimation";

type ScreenProps = {
    isComp: boolean;
}

const Screen: React.FC<ScreenProps> = ({ isComp }) => {
    const screenRef = useRef<ThreeGroup>(null);
    const { playersForGame } = usePlayers();

    const { handleCameraAnimation } = useCameraAnimation()

    // Add event key press D to switch camera to default position
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Digit1") {
                e.preventDefault()
                if (!screenRef.current) return
                handleCameraAnimation(screenRef.current)
            }

            if (e.code === "Escape" || e.code === "Digit3") {
                e.preventDefault()
                handleCameraAnimation(screenRef.current, 0, true)
            }
        }
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    useEffect(() => {
        if (isComp) {
            handleCameraAnimation(screenRef.current)
        }
    }, [isComp])


    return <group ref={screenRef} position={[0, 3, 0]}>
        <Root backgroundColor="orange" sizeX={playersForGame.length * 1.5} sizeY={3} padding={15}>
            {/* <Container positionType={"absolute"} positionRight={0} positionTop={0} backgroundColor={"red"} zIndexOffset={2} width={10} height={10} justifyContent={"center"} alignItems={"center"}>
                <Text fontSize={10} color={"white"} onClick={() => handleCameraAnimation(controls, screenRef.current, 0, true)}>
                    x
                </Text>
            </Container> */}
            <Container padding={15} gapColumn={2} flexGrow={1} backgroundColor="black" gap={20}>
                {playersForGame.map((player: PlayerState) => <Chat player={player} />)}
            </Container>
        </Root>
    </group>;
}

export default Screen;