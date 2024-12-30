import React, { useState, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame, useLoader } from '@react-three/fiber';

const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

type PickableItemProps = {
    onPickUp: () => void;
    playerRef: any;
    attachedItem: any;
};

const PickableItem: React.FC<PickableItemProps> = ({ onPickUp, playerRef, attachedItem }) => {
    const [color, setColor] = useState(generateRandomColor);
    const item = useRef(null);

    const handleClick = (e) => {
        onPickUp(e);
    };

    useFrame(() => {
        if (item.current && playerRef.current && attachedItem) {
            const { x, y, z } = playerRef.current.translation();
            item.current.position.set(x + 1, y + 1, z);
        }
    });

    return (
        <RigidBody type="dynamic" colliders="cuboid">
            <mesh
                onClick={handleClick}
                position={[2, 1, 5]}
                castShadow
                receiveShadow
                ref={item}
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </RigidBody>
    );
};

export default PickableItem;
