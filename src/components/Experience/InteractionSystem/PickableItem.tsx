import React, { useState, useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { ThreeEvent, useFrame, useLoader } from '@react-three/fiber';
import { Mesh, Object3D } from 'three';
import { Letter } from '../useLetters';
import { myPlayer } from 'playroomkit';

const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

type PickableItemProps = {
    onPickUp: (item: any | null) => void;
    letter: Letter;
    isAttached: boolean;
    setPostLetter: React.Dispatch<React.SetStateAction<Mesh | null>>;
};

type LetterMeshProps = {
    letter: Letter;
    handleClick: (e: ThreeEvent<MouseEvent>) => void;
    color: string;
};

const LetterMesh = React.forwardRef<Mesh, LetterMeshProps>(({ letter, handleClick, color }, ref) => (
    <mesh
        ref={ref}
        onClick={handleClick}
        position={[letter.position.x, letter.position.y, letter.position.z]}
        castShadow
        receiveShadow
        name={'letter'}
        userData={{ msg: letter.msg }}
        uuid={letter.uuid}
    >
        <boxGeometry args={[0.2, 0.3, 0.1]} />
        <meshStandardMaterial color={letter ? "orange" : color} />
    </mesh>
));

const PickableItem: React.FC<PickableItemProps> = ({ onPickUp, letter, isAttached, setPostLetter }) => {
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


    useEffect(() => {
        console.log("letter", letter);
        
        if (letter.owner === myPlayer().id && letter.isInPostBox) {
            console.log("cool");
            
            setPostLetter(item.current)
        } else {
            setPostLetter(null)
        }
    }, [letter])

    return (
        <LetterMesh
            ref={item}
            letter={letter}
            handleClick={handleClick}
            color={color}
        />
    );
};

export default PickableItem;
