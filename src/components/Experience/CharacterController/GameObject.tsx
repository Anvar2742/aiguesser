
import React from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Mesh } from 'three';
import { Letter } from '../helpers/useLetters';

type GameObjectProps = {
    letter: Letter;
    handleClick: (e: ThreeEvent<MouseEvent>) => void;
    color: string;
};

const GameObject = React.forwardRef<Mesh, GameObjectProps>(({ letter, handleClick, color }, ref) => (
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
export default GameObject