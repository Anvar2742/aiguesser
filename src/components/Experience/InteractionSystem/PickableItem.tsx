import React, { useState, useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { ThreeEvent, useFrame, useLoader } from '@react-three/fiber';
import { Mesh, Object3D } from 'three';
import { Letter } from '../useLetters';

const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

type PickableItemProps = {
    onPickUp: (item: any | null) => void;
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
            position={[letter.position.x, letter.position.y, letter.position.z]}
            castShadow
            receiveShadow
            name={'letter'}
            userData={{msg: letter.msg}}
            uuid={letter.uuid}
        >
            <boxGeometry args={[.2, .3, .1]} />
            <meshStandardMaterial color={letter ? "orange" : color} />
        </mesh>
    );
};

export default PickableItem;
