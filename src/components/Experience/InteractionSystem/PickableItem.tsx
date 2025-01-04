import React, { useState, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame, useLoader } from '@react-three/fiber';

const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

type PickableItemProps = {
    onPickUp: (item: { current: any; }) => void;
};

const PickableItem: React.FC<PickableItemProps> = ({ onPickUp }) => {
    const [color, setColor] = useState(generateRandomColor);
    const item = useRef(null);

    const handleClick = () => {
        onPickUp(item);
    };

    return (
        <RigidBody type="dynamic" colliders="cuboid">
            <mesh
                onClick={handleClick}
                position={[2, 1, 5]}
                castShadow
                receiveShadow
                ref={item}
                name='Letter'
            >
                <boxGeometry args={[.2, .3, .1]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </RigidBody>
    );
};

export default PickableItem;
