import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Group as ThreeGroup, Vector3 } from 'three';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import { myPlayer, PlayerState } from 'playroomkit';
import usePlayers from './usePlayers';
import useLetters, { LetterUI } from './useLetters';
import { Container, Root, Text } from '@react-three/uikit';

const Computer = () => {
    const postBoxRef = useRef<ThreeGroup>(null);
    const screenRef = useRef<ThreeGroup>(null);
    const [isComp, setIsComp] = useState(false);
    const { camera } = useThree();
    const controls = useRef<ThreeOrbitControls | null>(null);
    const tweenGroup = useRef(new Group());
    const { players, seeker } = usePlayers();
    const { lettersUI } = useLetters();

    const computerInit = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (!isComp) {
            setIsComp(true);
        }
    };

    useEffect(() => {
        if (isComp && screenRef.current) {
            if (!controls.current) return;

            const targetPoint = new Vector3(screenRef.current.position.x, screenRef.current.position.y, screenRef.current.position.z);

            // Tween for controls target
            const tweenTarget = new Tween(controls.current.target)
                .to(
                    {
                        x: targetPoint.x,
                        y: targetPoint.y,
                    },
                    500
                )
                .easing(Easing.Cubic.Out)
                .start();

            // Tween for camera position to match the Y-axis of the target
            const cameraTargetPosition = new Vector3(
                targetPoint.x,
                targetPoint.y + .25,
                targetPoint.z + 15
            );

            const tweenPos = new Tween(camera.position)
                .to(
                    {
                        x: cameraTargetPosition.x,
                        y: cameraTargetPosition.y,
                        z: cameraTargetPosition.z,
                    },
                    500
                )
                .onComplete(() => setIsComp(false))
                .easing(Easing.Cubic.Out)
                .start();

            tweenGroup.current.add(tweenTarget);
            tweenGroup.current.add(tweenPos);
        }
    }, [isComp, camera, tweenGroup]);

    useFrame(() => {
        tweenGroup.current.update();
        // console.log(camera);
        
    });

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
            <group ref={screenRef} position={[0, 4, 0]}>
                <Root backgroundColor="orange" sizeX={players.length > 3 ? 12 : 8} sizeY={4} flexDirection="row" padding={32}>
                    <Container
                        padding={15}
                        flexGrow={1}
                        alignItems="flex-start"
                        justifyContent="space-between"
                        positionBottom={5}
                        backgroundColor="black"
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
                                    <Container flexDirection="column" key={player.id}>
                                        <Text
                                            fontSize={15}
                                            color="#f5f5f5"
                                            fontWeight={700}
                                            backgroundColor={player.getProfile()?.color?.hex}
                                            paddingY={4}
                                            paddingX={8}
                                            borderRadius={5}
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
                                                                fontSize={12}
                                                                color="#f5f5f5"
                                                                alignSelf={letter.from === seeker?.id ? "flex-start" : "flex-end"}
                                                                maxWidth={300}
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
