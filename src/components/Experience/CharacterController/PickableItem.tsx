import React, { useRef, useEffect } from 'react';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Letter } from '../helpers/useLetters';
import { myPlayer } from 'playroomkit';
import GameObject from './GameObject';

type PickableItemProps = {
    onPickUp: (item: any | null) => void;
    letter: Letter;
    isAttached: boolean;
    setPostLetter: React.Dispatch<React.SetStateAction<Mesh | null>>;
};

const PickableItem: React.FC<PickableItemProps> = ({ onPickUp, letter, isAttached, setPostLetter }) => {
    const item = useRef<any | null>(null);

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPickUp(e.eventObject);
    };


    useFrame(() => {
        if (item.current && isAttached) {
            item.current.position.set(0, 0, 0);
        }
    });


    useEffect(() => {
        if (letter.owner === myPlayer().id && letter.isInPostBox) {
            setPostLetter(item.current)
        } else {
            setPostLetter(null)
        }
    }, [letter])

    return (
        <GameObject
            ref={item}
            letter={letter}
            handleClick={handleClick}
            color={"white"}
        />
    );
};

export default PickableItem;
