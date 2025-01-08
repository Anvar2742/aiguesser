import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Environment, MeshPortalMaterial, OrbitControls } from '@react-three/drei';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Group as ThreeGroup, Quaternion, Vector3, PerspectiveCamera } from 'three';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import { PlayerState, usePlayersList } from 'playroomkit';
import usePlayers from './usePlayers';
import useLetters, { Letter, LetterUI } from './useLetters';
import { Container, Content, Fullscreen, Root, Text } from '@react-three/uikit';

type ComputerProps = {

};

const Computer = forwardRef<any, ComputerProps>(({ }, ref) => {
    const postBoxRef = useRef<ThreeGroup>(null);
    const screenRef = useRef<ThreeGroup>(null);
    const [isComp, setIsComp] = useState(false);
    const { camera } = useThree();
    const controls = useRef<ThreeOrbitControls | null>(null);
    const tweenGroup = useRef(new Group());
    const { allPlayersExceptMe, seeker } = usePlayers();
    const { myLettersUI } = useLetters();

    const computerInit = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (!isComp) {
            setIsComp(true);
        }
    };

    useEffect(() => {
        if (isComp && screenRef.current) {
            if (!controls.current) return;
            console.log(screenRef.current);

            const targetPoint = new Vector3(screenRef.current.position.x, screenRef.current.position.y, screenRef.current.position.z);

            // Tween for controls target
            const tweenTarget = new Tween(controls.current.target)
                .to(
                    {
                        y: targetPoint.y,
                    },
                    500
                )
                .easing(Easing.Cubic.Out)
                .start();

            // Tween for camera position to match the Y-axis of the target
            const cameraTargetPosition = new Vector3(
                camera.position.x,
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
                .easing(Easing.Cubic.Out)
                .start();

            tweenGroup.current.add(tweenTarget);
            tweenGroup.current.add(tweenPos);
        }
    }, [isComp, camera, tweenGroup]);

    useFrame(() => {
        tweenGroup.current.update();
    });

    return (
        <group
            position={[0, 0, 0]}
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
                <Root backgroundColor="orange" sizeX={8} sizeY={4} flexDirection="row" padding={32}>
                    <Container padding={15} flexGrow={1} alignItems="flex-start" justifyContent="space-between" positionBottom={5} backgroundColor="black">
                        {
                            allPlayersExceptMe.map((player: PlayerState) => {
                                {
                                    return (
                                        <Container flexDirection={"column"}>
                                            <Text
                                                fontSize={15}
                                                color="#f5f5f5"
                                                fontWeight={700}
                                                backgroundColor={player.getProfile()?.color?.hex}
                                                paddingY={4}
                                                paddingX={8}
                                            >
                                                Chat with: {player.getProfile().name}
                                            </Text>
                                            <Container flexDirection={"column"} gap={10} paddingTop={15}>
                                                {
                                                    myLettersUI
                                                        ?.filter((letter: LetterUI) => letter.from === player.id || letter.to === player.id)
                                                        ?.map((letter: LetterUI) => {
                                                            return (
                                                                <Text
                                                                    fontSize={12}
                                                                    color="#f5f5f5"
                                                                    textAlign={letter.from === seeker?.id ? "left" : "right"}
                                                                    maxWidth={300}
                                                                >
                                                                    {/* {letter.from === seeker?.id ? "Seeker" : "Hider"}:  */}
                                                                    {letter.msg ?? ''}
                                                                </Text>
                                                            );
                                                        })
                                                }
                                            </Container>
                                        </Container>
                                    )
                                }
                            })
                        }
                    </Container>
                </Root>
            </group>
            <OrbitControls ref={controls} />
        </group>
    );
});

export default Computer;
