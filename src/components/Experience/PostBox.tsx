import React, { useEffect, useRef, useState } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import useLetters from './useLetters';

type PostBoxProps = {
    heldObject: Mesh | null; // The object currently held by the player
    onObjectSent: (e: any) => void; // Callback to inform the parent when the object is sent
    setPostedObject: any;
    postedObject: Mesh | null;
};

const PostBox: React.FC<PostBoxProps> = ({ heldObject, onObjectSent, setPostedObject, postedObject }) => {
    const postBoxRef = useRef<Mesh>(null);    

    const handlePost = (e: any) => {
        e.stopPropagation();
        if (heldObject && postBoxRef.current) {
            // Position the held object near the post box with an offset

            // Attach the held object to the post box
            postBoxRef.current.attach(heldObject);

            // Set the held object as posted
            setPostedObject(heldObject);
        }
    };

    useFrame(() => {
        postedObject?.position.set(0, 0, 0).add({ x: 0, y: 1, z: 0 });
    })
    

    return (
        <RigidBody
            colliders={false}
            type="fixed"
            position={[3, .5, 3]} // Adjust position as necessary
        >
            <mesh
                ref={postBoxRef}
                onClick={handlePost}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="yellow" />
            </mesh>
            <mesh
                onClick={onObjectSent}
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
        </RigidBody>
    );
};

export default PostBox;
