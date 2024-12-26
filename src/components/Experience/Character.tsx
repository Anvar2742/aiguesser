import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Vector3, AnimationMixer, Euler } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Position } from './utills';

type CharacterProps = {
    targetPosition: Position;
    onArrival: () => void;
};

const Character: React.FC<CharacterProps> = ({ targetPosition, onArrival }) => {
    const ref = useRef<any>();
    const fbx = useLoader(FBXLoader, '/models/Walking.fbx'); // Use relative path to the public directory
    const mixer = useRef<AnimationMixer | null>(null);

    console.log(fbx);
    useFrame((state, delta) => {
        if (mixer.current) mixer.current.update(delta);

        if (ref.current && targetPosition) {
            const { x: tx, z: tz } = targetPosition;
            const translation = ref.current.translation();
            const cx = translation.x;
            const cz = translation.z;

            const speed = 2.5; // Movement speed
            const dx = tx - cx;
            const dz = tz - cz;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (fbx.animations.length > 0 && !mixer.current) {
                mixer.current = new AnimationMixer(fbx);
            }
            const walkAnimation = fbx.animations.find(
                (clip) => clip.name.toLowerCase().includes('mixamo.com')
            );

            if (distance > 0.1) {
                const vx = (dx / distance) * speed;
                const vz = (dz / distance) * speed;

                // Use setLinvel to move the character
                ref.current.setLinvel(new Vector3(vx, 0, vz), true);

                // Rotate the character to face the target
                const rotation = Math.atan2(dz, dx);
                ref.current.setRotation(new Euler(0, rotation, 0));
                // fbx.setRotationFromEuler(new)
                

                if (walkAnimation && mixer.current) {
                    mixer.current.clipAction(walkAnimation).play();
                }
            } else {
                // Stop movement when close to target
                ref.current.setLinvel(new Vector3(0, 0, 0));
                onArrival();
                if (walkAnimation && mixer.current) {
                    mixer.current.clipAction(walkAnimation).stop();
                }
            }
        }
    });

    return (
        <RigidBody
            ref={ref}
            colliders={false}
            type="dynamic" // Ensure the RigidBody is dynamic
            restitution={0.5} // Makes it slightly bouncy
            position={[0, 0, 0]}
            linearDamping={0.5} // Prevent sliding
            angularDamping={0.5}
        >
            <primitive object={fbx} scale={0.01} castShadow />
            {/* <mesh castShadow>
                <boxGeometry args={[.5, 1, 1,]} />
                <meshStandardMaterial color="blue" />
            </mesh> */}
        </RigidBody>
    );
};

export default Character;
