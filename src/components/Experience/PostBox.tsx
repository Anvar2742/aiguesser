import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Group, Mesh, Object3D } from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import useLetters from './useLetters';
import { myPlayer, usePlayersList } from 'playroomkit';

type PostBoxProps = {
    onObjectPut: (e: ThreeEvent<MouseEvent>) => void; // Callback to inform the parent when the object is sent
    onObjectSent: (e: ThreeEvent<MouseEvent>, to: string | null) => void; // Callback to inform the parent when the object is sent
    postedObject: any | null; // The object that is in the post box
};

const PostBox = forwardRef<any, PostBoxProps>(({ onObjectSent, onObjectPut, postedObject }, ref) => {
    const postBoxRef = useRef<Group>(null);
    const [toPlayer, setToPlayer] = useState<string | null>(null)
    const players = usePlayersList();

    // Expose the local ref to the parent component through the forwarded ref
    useImperativeHandle(ref, () => postBoxRef.current);

    useFrame(() => {
        if (postBoxRef.current) {
            postedObject?.position.set(0, 1, 0);
        }
    })

    // TEMP
    useEffect(() => {
        if (players.length > 0) {
            const player = players.find((p) => p.id !== myPlayer()?.id)
            console.log(player)
            setToPlayer(player?.id ?? null)
        }
    }, [players])

    return (
        <group
            position={[3, .5, 3]}
            ref={postBoxRef}
            onContextMenu={onObjectPut}
        >
            <mesh
                castShadow
                receiveShadow
                name='post-box'
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="yellow" />
            </mesh>
            <mesh
                onClick={(e) => onObjectSent(e, toPlayer)}
                castShadow
                receiveShadow
                position={[.75, .25, .25]}
            >
                <boxGeometry args={[.5, .5, .5]} />
                <meshStandardMaterial color="red" />
            </mesh>

            {/* Render the posted object */}
            {postedObject && (
                <primitive object={postedObject} />
            )}
        </group>
    );
});

export default PostBox;
