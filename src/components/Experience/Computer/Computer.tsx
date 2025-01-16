import Screen from './Screen';
import { ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Group as ThreeGroup } from 'three';
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';

type ComputerProps = {
    controls: ThreeOrbitControls | null;
}
const Computer: React.FC<ComputerProps> = ({ controls }) => {
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
            <Screen controls={controls} isComp={isComp} />
        </group>
    );
};

export default Computer;
