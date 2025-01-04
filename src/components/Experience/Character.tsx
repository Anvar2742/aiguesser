import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Vector3, AnimationMixer } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Position } from './utills';

type CharacterProps = {
    targetPosition: Position;
    onArrival: () => void;
};

const Character: React.FC<CharacterProps> = ({ targetPosition, onArrival }) => {
    const ref = useRef<any>();
    const walkFBX = useLoader(FBXLoader, '/models/Walking.fbx'); // Walking animation FBX
    const idleFBX = useLoader(FBXLoader, '/models/Idle.fbx'); // Idle animation FBX

    const mixer = useRef<AnimationMixer | null>(null);
    const currentAction = useRef<any>(null);

    const playAnimation = (fbx: any, clipName: string, playbackRate: number = 1) => {
        if (!mixer.current) return;

        const transitionSpeed = 0.3
        const clip = fbx.animations.find((anim: { name: string; }) => anim.name.toLowerCase().includes(clipName.toLowerCase()));
        if (clip) {
            const action = mixer.current.clipAction(clip);
            action.timeScale = playbackRate; // Adjust playback speed
            if (currentAction.current !== action) {
                if (currentAction.current) {
                    currentAction.current.crossFadeTo(action, transitionSpeed, true).stop();
                }
                action.reset().fadeIn(transitionSpeed).play();
                currentAction.current = action;
            }
        } else {
            // No animation found
            if (currentAction.current) {
                currentAction.current.fadeOut(transitionSpeed);
                currentAction.current = null;
            }
            console.log("No animation found for", clipName);
        }
    };

    useFrame((_, delta) => {
        if (mixer.current) mixer.current.update(delta);

        if (ref.current && targetPosition) {
            const { x: tx, z: tz } = targetPosition;
            const translation = ref.current.translation();
            const cx = translation.x;
            const cz = translation.z;

            const speed = 2; // Movement speed
            const dx = tx - cx;
            const dz = tz - cz;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (!mixer.current) {
                mixer.current = new AnimationMixer(walkFBX);
            }

            // Play and stop animation with more delay
            if (distance > 0.2) {
                playAnimation(walkFBX, 'mixamo.com', 1.5); // Play walking animation with faster spee
            } else {
                playAnimation(idleFBX, 'mixamo.com'); // Play idle animation when stopped
            }

            // Movement & rotation
            if (distance > 0.1) {
                const vx = (dx / distance) * speed;
                const vz = (dz / distance) * speed;

                // Use setLinvel to move the character
                ref.current.setLinvel(new Vector3(vx, 0, vz), true);

                // Rotate the character to face the target
                const rotation = Math.atan2(dx, dz);
                walkFBX.rotation.set(0, rotation, 0)
            } else {
                // Stop movement when close to target
                ref.current.setLinvel(new Vector3(0, 0, 0));
                onArrival();
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
            <primitive object={walkFBX} scale={0.01} castShadow />
        </RigidBody>
    );
};

export default Character;