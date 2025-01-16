import Screen from './Screen';
import { ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Group as ThreeGroup } from 'three';

const Computer = () => {
    const postBoxRef = useRef<ThreeGroup>(null);
    const [isComp, setIsComp] = useState(false)


    const computerInit = (e: ThreeEvent<MouseEvent> | null = null) => {
        e?.stopPropagation();
        setIsComp(true)
    };


    return (
        <group
            position={[0, 0, 3]}
            ref={postBoxRef}
        >
            <mesh
                castShadow
                receiveShadow
                name='computer'
                onClick={computerInit}
                position={[0, .5, 0]}
            >
                <boxGeometry args={[5, 1, 1]} />
                <meshStandardMaterial color="blue" />
            </mesh>

            {/* Chat window */}
            <Screen isComp={isComp} />
        </group>
    );
};

export default Computer;
