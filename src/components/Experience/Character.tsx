import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Vector3, AnimationMixer } from 'three';
import { useGLTF } from '@react-three/drei';
import { Position } from './utills';

type CharacterProps = {
    targetPosition: Position;
    onArrival: () => void;
};

const Character = forwardRef<any, CharacterProps>(({ targetPosition, onArrival }, ref) => {
    const localRef = useRef<any>();
    const { scene: characterScene, animations: walkAnimations } = useGLTF('/models/robot.glb');
    // const { scene: idleScene, animations: idleAnimations } = useGLTF('/models/Idle.glb'); // Idle animation

    const mixer = useRef<AnimationMixer | null>(null);
    const currentAction = useRef<any>(null);

    // Expose the local ref to the parent component through the forwarded ref
    useImperativeHandle(ref, () => ({
        rigidBody: localRef.current, // Expose the rigid body
        characterScene: characterScene,       // Expose the walk GLTF scene
    }));

    const playAnimation = (animations: any[], clipName: string, playbackRate: number = 1) => {
        if (!mixer.current) return;

        const clip = animations.find((anim) =>
            anim.name.toLowerCase().includes(clipName.toLowerCase())
        );
        if (clip) {
            const action = mixer.current.clipAction(clip);
            action.timeScale = playbackRate; // Adjust playback speed
            if (currentAction.current !== action) {
                if (currentAction.current) {
                    currentAction.current.crossFadeTo(action, 0.1, true).stop();
                }
                action.reset().fadeIn(0.1).play();
                currentAction.current = action;
            }
        } else {
            // No animation found
            if (currentAction.current) {
                currentAction.current.fadeOut(0.1);
                currentAction.current = null;
            }
        }
    };

    useEffect(() => {
        if (!mixer.current) {
            mixer.current = new AnimationMixer(characterScene);
        }
        return () => {
            if (mixer.current) {
                mixer.current.stopAllAction();
                mixer.current = null;
            }
        };
    }, [characterScene]);

    useFrame((_, delta) => {
        if (mixer.current) mixer.current.update(delta);

        if (localRef.current && targetPosition) {
            const { x: tx, z: tz } = targetPosition;
            const translation = localRef.current.translation();
            const cx = translation.x;
            const cz = translation.z;

            const speed = 2; // Movement speed
            const dx = tx - cx;
            const dz = tz - cz;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance > 0.1) {
                const vx = (dx / distance) * speed;
                const vz = (dz / distance) * speed;

                // Use setLinvel to move the character
                localRef.current.setLinvel(new Vector3(vx, 0, vz), true);

                // Rotate the character to face the target
                const rotation = Math.atan2(dx, dz);
                characterScene.rotation.set(0, rotation, 0);

                playAnimation(walkAnimations, 'walk', 1.5); // Play walking animation
            } else {
                // Stop movement when close to target
                localRef.current.setLinvel(new Vector3(0, 0, 0));
                onArrival();
                playAnimation(walkAnimations, 'idle'); // Play idle animation
            }
        }
    });

    return (
        <RigidBody
            ref={localRef}
            colliders={false}
            type="dynamic"
            restitution={0.5}
            position={[0, .8, 5]}
            linearDamping={0.5}
            angularDamping={0.5}
        >
            <primitive object={characterScene} scale={0.003} castShadow />
        </RigidBody>
    );
});

export default Character;

// Preload the GLTF files
useGLTF.preload('/models/Walking.glb');
// useGLTF.preload('/models/Idle.glb');
