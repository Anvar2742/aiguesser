import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Group as ThreeGroup, Quaternion, Vector3 } from 'three';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';

type ComputerProps = {

};

const Computer = forwardRef<any, ComputerProps>(({ }, ref) => {
    const postBoxRef = useRef<ThreeGroup>(null);
    const screenRef = useRef<ThreeGroup>(null);
    const [isComp, setIsComp] = useState(false);
    const { camera } = useThree();
    const controls = useRef<ThreeOrbitControls | null>(null);
    const tweenGroup = useRef(new Group());

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
                        y: targetPoint.y + .5,
                    },
                    500
                )
                .easing(Easing.Cubic.Out)
                .start();

            // Tween for camera position to match the Y-axis of the target
            const cameraTargetPosition = new Vector3(
                camera.position.x,
                targetPoint.y + .25,
                targetPoint.z + 6
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
            position={[0, .5, 0]}
            ref={postBoxRef}
        >
            <mesh
                castShadow
                receiveShadow
                name='computer'
                onClick={computerInit}
            >
                <boxGeometry args={[5, 1, 1]} />
                <meshStandardMaterial color="blue" />
            </mesh>

            <group position={[0, 3, 0]} ref={screenRef}>
                {/* Chat Window Plane */}
                <mesh>
                    <planeGeometry args={[5, 3]} />
                    <meshStandardMaterial color="#000" opacity={.9} transparent />
                </mesh>
                <Text
                    position={[-1, 0, .1]}
                    fontSize={0.25}
                    color="#fff"
                    maxWidth={4}
                    lineHeight={1.2}
                    anchorX="left"
                    anchorY="top"
                >
                    Messages
                </Text>
            </group>

            <OrbitControls ref={controls} />
        </group>
    );
});

export default Computer;
