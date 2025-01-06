import React, { useState, useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { ThreeEvent, useFrame, useLoader } from '@react-three/fiber';
import { Mesh, Object3D } from 'three';
import { Letter } from '../useLetters';

const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

type PickableItemProps = {
    onPickUp: (item: Object3D | null) => void;
    letter: Letter;
    isAttached: boolean;
};

const PickableItem: React.FC<PickableItemProps> = ({ onPickUp, letter, isAttached }) => {
    const [color, setColor] = useState(generateRandomColor);
    const item = useRef<any | null>(null);

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        // console.log(e);
        
        onPickUp(e.eventObject);
    };


    useFrame(() => {
        if (item.current && isAttached) {
            item.current.position.set(0, 0, 0);
        }
    });


    return (
        <mesh
            ref={item}
            onClick={handleClick}
            position={[2, 1, 5]}
            castShadow
            receiveShadow
            name={'letter'}
        >
            <boxGeometry args={[.2, .3, .1]} />
            <meshStandardMaterial color={letter ? "orange" : color} />
        </mesh>
    );
};

export default PickableItem;
