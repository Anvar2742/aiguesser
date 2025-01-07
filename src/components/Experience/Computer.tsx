import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Group } from 'three';

type ComputerProps = {

};

const Computer = forwardRef<any, ComputerProps>(({ }, ref) => {
    const postBoxRef = useRef<Group>(null);

    return (
        <group
            position={[0, .5, 0]}
            ref={postBoxRef}
        >
            <mesh
                castShadow
                receiveShadow
                name='computer'
            >
                <boxGeometry args={[5, 1, 1]} />
                <meshStandardMaterial color="blue" />
            </mesh>
        </group>
    );
});

export default Computer;
