import React, { useState, useRef, useEffect } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Letter } from '../useLetters';
import { myPlayer } from 'playroomkit';

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
        <boxGeometry args={[0.4, 0.5, 0.1]} />
        <meshStandardMaterial color={color} />
    </mesh>
));

const PickableItem: React.FC<PickableItemProps> = ({ onPickUp, letter, isAttached, setPostLetter }) => {
    const [color] = useState("white");
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
        // console.log("letter", letter);

        if (letter.owner === myPlayer().id && letter.isInPostBox) {
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
