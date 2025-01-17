import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Vector3, AnimationMixer } from 'three';
import { useGLTF } from '@react-three/drei';
import { Position } from './../helpers/utills';

type usePlayAnimationProps = {
    onArrival: () => void;
    characterRef: any;
    characterScene: any;
    walkAnimations: any
};


const usePlayAnimation = ({ characterRef, onArrival, characterScene, walkAnimations }: usePlayAnimationProps) => {
    const mixer = useRef<AnimationMixer | null>(null);
    const currentAction = useRef<any>(null);
    const [targetPosition, setTargetPosition] = useState<Position | null>(null)

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

        if (characterRef.current && targetPosition) {
            const { x: tx, z: tz } = targetPosition;
            const translation = characterRef.current.translation();
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
                characterRef.current.setLinvel(new Vector3(vx, 0, vz), true);

                // Rotate the character to face the target
                const rotation = Math.atan2(dx, dz);
                characterScene.rotation.set(0, rotation, 0);

                playAnimation(walkAnimations, 'walk', 1.5); // Play walking animation
            } else {
                // Stop movement when close to target
                characterRef.current.setLinvel(new Vector3(0, 0, 0));
                // Character arrived to destination
                onArrival();
                playAnimation(walkAnimations, 'idle'); // Play idle animation
                setTargetPosition(null)
            }
        }
    });

    const updateTargetPosition = (newTargetPos: Position | null) => {
        setTargetPosition(newTargetPos)
    }


    return { updateTargetPosition }
}

export default usePlayAnimation