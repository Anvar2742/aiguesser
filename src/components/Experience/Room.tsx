import React, { useState, useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import Chat from './Chat';
import { Position } from './utills';
import Character from './Character';
import Plane from './Plane';
import PickableItem from './InteractionSystem/PickableItem';
import PostBox from './PostBox';
import { Mesh, Object3D } from 'three';
import { OrbitControls, Text } from '@react-three/drei';
import useLetters, { Letter } from './useLetters';
import { myPlayer } from 'playroomkit';

const Room: React.FC = () => {
    // Position & Movement
    const playerRef = useRef<any>();
    const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, z: 1 });
    const [indicatorPosition, setIndicatorPosition] = useState<Position | null>(null);

    // Interaction
    const [heldObject, setHeldObject] = useState<Object3D | null>(null)

    // Post box
    const [postedObject, setPostedObject] = useState<Mesh | null>(null);
    // Multiplayer (all letters)
    const { letters, addLetter, updateLetter } = useLetters();
    const { scene } = useThree()

    // Update targetPosition & indicatorPosition
    const handlePlaneClick = (position: Position) => {
        setTargetPosition(position);
        setIndicatorPosition(position);
    };

    // Event when player arrived
    const handleArrival = () => {
        setIndicatorPosition(null);
    };

    /**
     * Attach letter mesh to the hand bone
     * Set heldObject
     * Set null postedObject
     * @param item Mesh of the letter
     * @returns void
     */
    const handlePickUp = (item: Object3D | null) => {
        if (!item) return
        item.position.set(0, 0, 0)
        playerRef.current.fbxObject.getObjectByName("mixamorigRightHand")?.attach(item)

        setHeldObject(item)
        setPostedObject(null)
    }

    const handleObjectSent = (e: any) => {
        e.stopPropagation()
        // console.log(heldObject);
        // addLetter(heldObject)
    }

    // useEffect(() => {
    //     console.log(letters);
    // }, [letters])

    const handleRightClick = (e: any) => {
        if (heldObject) {
            // Reattach the held object to the scene
            scene.attach(heldObject);

            // Set the object's position to the clicked position on the plane
            heldObject.position.set(e.point.x, e.point.y, e.point.z);
        }
    };

    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight
                position={[10, 10, 10]}
                intensity={1}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <Chat />
            <Physics>
                <Plane onPlaneClick={handlePlaneClick} onRightClick={handleRightClick} />
                <Character targetPosition={targetPosition} onArrival={handleArrival} ref={playerRef} />
                {indicatorPosition && (
                    <mesh position={[indicatorPosition.x, 0, indicatorPosition.z]}>
                        <boxGeometry args={[0.5, 0.1, 0.5]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                )}
                {letters
                    .filter((letter: Letter) => letter.owner === myPlayer()?.id)
                    .map((letter: Letter) => {
                        return (
                            <PickableItem onPickUp={handlePickUp} letter={letter} isAttached={heldObject ? true : false} />
                        )
                    })}
                <PostBox heldObject={heldObject} onObjectSent={handleObjectSent} postedObject={postedObject} setPostedObject={setPostedObject} />
            </Physics>
            <gridHelper args={[30, 15]} />
            <OrbitControls />
        </>
    );
};

export default Room;
