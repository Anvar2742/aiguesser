import { ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group as ThreeGroup } from 'three';
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import { myPlayer, PlayerState } from 'playroomkit';
import usePlayers from '../helpers/usePlayers';
import useLetters, { LetterUI } from '../helpers/useLetters';
import { Container, FontFamilyProvider, Root, Text } from '@react-three/uikit';
import useCameraAnimation from '../helpers/useCameraAnimation';

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
        // const newTargetPoint = screenRef.current.position.clone()
        // console.log(newTargetPoint);
        handleCameraAnimation(controls, screenRef.current)
    };

    // Add event key press D to switch camera to default position
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Digit1") {
                e.preventDefault()
                computerInit()
            }

            if (e.code === "Escape" || e.code === "Digit3") {
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
                                    <Container flexDirection={"column"} justifyContent={"center"} width={"100%"} padding={10}>
                                        <FontFamilyProvider roboto={{
                                            medium: "fixed-roboto-condensed-msdf.json",
                                        }}>
                                            <Text
                                                fontSize={10}
                                                color="#f5f5f5"
                                                fontWeight={700}
                                                backgroundColor={"blue"}
                                                paddingY={4}
                                                paddingX={8}
                                                borderRadius={5}
                                                textAlign={"center"}
                                                alignSelf="center"
                                                maxHeight={20}
                                                marginBottom={15}
                                            >
                                                Игрок #{player.getState("postAddress")}
                                            </Text>
                                            <Container flexDirection="column" key={player.id} width="100%" borderColor={"gray"} borderWidth={2} padding={15} overflow={"scroll"} gap={10} height={"100%"}>
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
                                                                    fontSize={7}
                                                                    color="#f5f5f5"
                                                                    alignSelf={letter.from === seeker?.id ? "flex-start" : "flex-end"}
                                                                    maxWidth={150}
                                                                    backgroundColor={"#444"}
                                                                    borderRadius={10}
                                                                    paddingY={4}
                                                                    paddingX={8}
                                                                    maxHeight={20}
                                                                >
                                                                    {letter.msg ?? ''}
                                                                </Text>
                                                            );
                                                        })
                                                }
                                            </Container>
                                        </FontFamilyProvider>
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
