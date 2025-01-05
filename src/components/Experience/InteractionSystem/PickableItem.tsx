import React, { useState, useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh } from 'three';
import { Letter } from '../useLetters';

const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

type PickableItemProps = {
    onPickUp: (item: Mesh | null) => void;
    letter: Letter;
    isAttached: boolean;
};

const PickableItem: React.FC<PickableItemProps> = ({ onPickUp, letter, isAttached }) => {
    const [color, setColor] = useState(generateRandomColor);
    const item = useRef<any | null>(null);

    const handleClick = (e: any) => {
        e.stopPropagation();
        console.log(e.object);

        onPickUp(e.object);
    };


    useFrame(() => {
        if (item.current && isAttached) {
            item.current.position.set(0, 0, 0);
        }
    });

    useEffect(() => {
        console.log(item.current);
    }, [item.current])


    return (
        <mesh
            ref={item}
            onClick={handleClick}
            position={[2, 1, 5]}
            castShadow
            receiveShadow
            name={letter ? letter.mesh.name : "Default letter"}
        >
            <boxGeometry args={[.2, .3, .1]} />
            <meshStandardMaterial color={letter ? "orange" : color} />
        </mesh>
    );
};

export default PickableItem;
