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
import { cameraDefault } from './utills';

const Computer = () => {
    const postBoxRef = useRef<ThreeGroup>(null);
    const screenRef = useRef<ThreeGroup>(null);

    const { camera } = useThree();
    const controls = useRef<ThreeOrbitControls | null>(null);
    const tweenGroup = useRef(new Group());

    const { players, seeker } = usePlayers();
    const { lettersUI } = useLetters();

    const computerInit = (e: ThreeEvent<MouseEvent> | null = null) => {
        e?.stopPropagation();
        if (!screenRef.current) return
        const newTargetPoint = screenRef.current.position.clone()
        handleCameraAnimation(newTargetPoint, newTargetPoint)
    };

    const handleCameraAnimation = (targetPoint: Vector3, lookAtPos: Vector3 = new Vector3(0, 0, 0)) => {
        if (!controls.current) return
        // Look at the position
        const tweenTarget = new Tween(controls.current.target)
            .to(
                {
                    x: lookAtPos.x,
                    y: lookAtPos.y,
                    z: lookAtPos.z,
                },
                750
            )
            .easing(Easing.Cubic.Out)
            .start();
        tweenGroup.current.add(tweenTarget);

        if (!lookAtPos.equals(new Vector3(0, 0, 0))) {
            targetPoint.add(new Vector3(0, 0, 7))
        }

        // Tween for camera position to match the Y-axis of the target
        const cameraTargetPosition = new Vector3(
            targetPoint.x,
            targetPoint.y,
            targetPoint.z
        );
        // console.log(cameraTargetPosition);

        const tweenPos = new Tween(camera.position)
            .to(
                {
                    x: cameraTargetPosition.x,
                    y: cameraTargetPosition.y,
                    z: cameraTargetPosition.z,
                },
                750
            )
            .easing(Easing.Cubic.Out)
            .start();

        tweenGroup.current.add(tweenPos);
    }

    // useEffect(() => {
    //     if (isComp && screenRef.current) {
    //         handleCameraAnimation(newTargetPoint, newTargetPoint)
    //     }

    //     if (isDefault) {
    //         // console.log(camera);

    //     }
    // }, [isComp, isDefault, camera, tweenGroup]);

    useFrame(() => {
        tweenGroup.current.update();
    });

    // Add event key press D to switch camera to default position
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "KeyF") {
                e.preventDefault()
                computerInit()
            }

            if (e.code === "Escape" || e.code === "KeyD") {
                e.preventDefault()
                handleCameraAnimation(new Vector3(cameraDefault.position[0], cameraDefault.position[1], cameraDefault.position[2]))
            }
        }
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [])


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
                <Root backgroundColor="orange" sizeX={players.length * 1.5} sizeY={3} padding={15}>
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
                        <Text fontSize={10} color={"white"} onClick={() => handleCameraAnimation(new Vector3(cameraDefault.position[0], cameraDefault.position[1], cameraDefault.position[2]))}>
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
                            players.map((player: PlayerState) => {
                                const myRole = myPlayer().getState("role");
                                const playerRole = player.getState("role");

                                // Skip invalid combinations
                                if ((myRole === "hider" && playerRole === "seeker") || (myRole === "seeker" && playerRole === "seeker")) {
                                    return null;
                                }

                                return (
                                    <Container flexDirection="column" key={player.id} width="100%" borderColor={"gray"} borderWidth={1} padding={15}>
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
                                            Chat with: {player.getProfile().name}
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

            <OrbitControls ref={controls} />
        </group>
    );
};

export default Computer;
