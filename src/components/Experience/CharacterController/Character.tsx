import { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { Position } from './../helpers/utills';
import usePlayAnimation from './usePlayAnimation';

type CharacterProps = {
    targetPosition: Position;
    onArrival: () => void;
};

const Character = forwardRef<any, CharacterProps>(({ targetPosition, onArrival }, ref) => {
    const characterRef = useRef<any>();
    const { scene: characterScene, animations: walkAnimations } = useGLTF('/models/robot.glb');
    const props = { characterScene: characterScene, walkAnimations: walkAnimations, characterRef: characterRef, onArrival: onArrival }
    const { updateTargetPosition } = usePlayAnimation({ ...props })

    // Expose the local ref to the parent component through the forwarded ref
    useImperativeHandle(ref, () => ({
        rigidBody: characterRef.current, // Expose the rigid body
        characterScene: characterScene,       // Expose the walk GLTF scene
    }));

    useEffect(() => {
        updateTargetPosition(targetPosition)
    }, [targetPosition])



    return (
        <RigidBody
            ref={characterRef}
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
useGLTF.preload('/models/robot.glb');
