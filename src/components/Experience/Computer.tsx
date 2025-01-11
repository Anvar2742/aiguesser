import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { Group as ThreeGroup, Vector3 } from 'three';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import { myPlayer, PlayerState } from 'playroomkit';
import usePlayers from './usePlayers';
import useLetters, { LetterUI } from './useLetters';
import { Container, Root, Text } from '@react-three/uikit';
import useCameraAnimation from './MyControls';

type ComputerProps = {
    controls: ThreeOrbitControls | null;
}
const Computer: React.FC<ComputerProps> = ({ controls }) => {
    const postBoxRef = useRef<ThreeGroup>(null);
    const screenRef = useRef<ThreeGroup>(null);

    const { playersForGame, seeker } = usePlayers();
    const { lettersUI } = useLetters();
    const { handleCameraAnimation } = useCameraAnimation()


    const computerInit = (e: ThreeEvent<MouseEvent> | null = null) => {
        e?.stopPropagation();
        if (!screenRef.current) return
        const newTargetPoint = screenRef.current.position.clone()
        // console.log(newTargetPoint);
        handleCameraAnimation(controls, screenRef.current)
    };

    // Add event key press D to switch camera to default position
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "KeyF") {
                e.preventDefault()
                computerInit()
            }

            if (e.code === "Escape" || e.code === "KeyD") {
                e.preventDefault()
                handleCameraAnimation(controls, screenRef.current, 0, true)
            }
        }
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [controls])


    return (
        <group
            position={[0, 0, 3]}
            ref={postBoxRef}
        >
            <mesh
                castShadow
                receiveShadow
                name='computer'
                onClick={computerInit}
                position={[0, .5, 0]}
            >
                <boxGeometry args={[5, 1, 1]} />
                <meshStandardMaterial color="blue" />
            </mesh>

            {/* Chat window */}
            <group ref={screenRef} position={[0, 3, 0]}>
                <Root backgroundColor="orange" sizeX={playersForGame.length * 1.5} sizeY={3} padding={15}>
                    <Container
                        positionType={"absolute"}
                        positionRight={0}
                        positionTop={0}
                        backgroundColor={"red"}
                        zIndexOffset={2}
                        width={10}
                        height={10}
                        justifyContent={"center"}
                        alignItems={"center"}
                    >
                        <Text fontSize={10} color={"white"} onClick={() => handleCameraAnimation(controls, screenRef.current, 0, true)}>
                            x
                        </Text>
                    </Container>
                    <Container
                        padding={15}
                        gapColumn={2}
                        flexGrow={1}
                        backgroundColor="black"
                        gap={20}
                    >
                        {
                            playersForGame.map((player: PlayerState) => {
                                const myRole = myPlayer().getState("role");
                                const playerRole = player.getState("role");

                                // Skip invalid combinations
                                if ((myRole === "hider" && playerRole === "seeker") || (myRole === "seeker" && playerRole === "seeker")) {
                                    return null;
                                }

                                return (
                                    <Container flexDirection="column" key={player.id} width="100%" borderColor={"gray"} borderWidth={2} padding={15}>
                                        <Text
                                            fontSize={8}
                                            color="#f5f5f5"
                                            fontWeight={700}
                                            backgroundColor={"blue"}
                                            paddingY={4}
                                            paddingX={8}
                                            borderRadius={5}
                                            textAlign={"center"}
                                            alignSelf="center"
                                        >
                                            Chat with player #{player.getState("postAddress")}
                                        </Text>
                                        <Container flexDirection="column" gap={10} paddingTop={15}>
                                            {
                                                lettersUI
                                                    ?.filter((letter: LetterUI) => {
                                                        const isBetweenSeekerAndPlayer = (letter.from === seeker?.id && letter.to === player?.id) || (letter.from === player?.id && letter.to === seeker?.id);
                                                        return isBetweenSeekerAndPlayer;
                                                    })
                                                    ?.map((letter: LetterUI, index: number) => {
                                                        return (
                                                            <Text
                                                                key={index}
                                                                fontSize={6}
                                                                color="#f5f5f5"
                                                                alignSelf={letter.from === seeker?.id ? "flex-start" : "flex-end"}
                                                                maxWidth={150}
                                                                backgroundColor={"#444"}
                                                                borderRadius={10}
                                                                paddingY={4}
                                                                paddingX={8}
                                                            >
                                                                {letter.msg ?? ''}
                                                            </Text>
                                                        );
                                                    })
                                            }
                                        </Container>
                                    </Container>
                                );
                            })
                        }
                    </Container>
                </Root>
            </group>
        </group>
    );
};

export default Computer;
