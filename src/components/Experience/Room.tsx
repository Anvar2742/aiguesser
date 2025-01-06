import React, { useState, useRef, useEffect } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import Chat from './Chat';
import { Position } from './utills';
import Character from './Character';
import Plane from './Plane';
import PickableItem from './InteractionSystem/PickableItem';
import PostBox from './PostBox';
import { Group, Mesh, Vector3, BufferGeometry, Material, NormalBufferAttributes, Object3DEventMap, ObjectLoader } from 'three';
import { OrbitControls, Text } from '@react-three/drei';
import useLetters, { Letter } from './useLetters';
import { myPlayer } from 'playroomkit';

const Room: React.FC = () => {
    // Position & Movement
    const playerRef = useRef<any>();
    const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, z: 1 });
    const [indicatorPosition, setIndicatorPosition] = useState<Position | null>(null);

    // Interaction
    const [heldObject, setHeldObject] = useState<any | null>(null)

    // Post box
    const [postedObject, setPostedObject] = useState<any | null>(null);
    const postBoxRef = useRef<Group>(null);

    // Multiplayer (all letters)
    const { letters, addLetter, updateLetterOwner } = useLetters();
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
    const handlePickUp = (item: any | null) => {
        if (!item) return
        item.position.set(0, 0, 0)
        playerRef.current.fbxObject.getObjectByName("mixamorigRightHand")?.attach(item)

        setHeldObject(item)
        setPostedObject(null)
    }

    /**
     * Drop held object to the clicked position
     * @param e ThreeEvent<MouseEvent>
     */
    const dropObject = (e: ThreeEvent<MouseEvent>) => {
        if (heldObject) {
            // Detach the held object from the player
            scene.attach(heldObject);

            // Update the held object's position to the clicked position
            heldObject.position.copy(e.point.add(new Vector3(0, 1, 0))); // Set position to the clicked point in the world
            heldObject.updateMatrixWorld(); // Ensure the matrix is updated to reflect the new position

            // Release the held object
            setHeldObject(null);
        }
    };


    /**
     * Put the held object in the post box
     * @param e ThreeEvent<MouseEvent>
     */
    const putObjectInPost = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        // console.log(e);

        if (heldObject && postBoxRef.current) {
            // Attach the held object to the post box
            postBoxRef.current.attach(heldObject);

            // Position the held object near the post box with an offset
            heldObject.position.copy(new Vector3(0, 1, 0));
            heldObject.updateMatrixWorld(); // Ensure the matrix is updated to reflect the new position
            // console.log(postBoxRef.current);

            // Set the held object as posted
            setPostedObject(heldObject);
            setHeldObject(null)
        }
    };

    /**
     * Send letters
     * @param e ThreeEvent<MouseEvent>
     */
    const sendLetter = (e: ThreeEvent<MouseEvent>, to: string | null) => {
        e.stopPropagation()
        if (!to) {
            console.error("No recipient selected")
            return
        }
        if (postedObject) {
            // Send the letter to another user
            const updatedLetter: Letter = {
                owner: to,
                to,
                from: myPlayer()?.id,
                uuid: postedObject.uuid,
                msg: postedObject.userData.msg,
            }
            updateLetterOwner(updatedLetter)

            // Set the posted object as null
            setPostedObject(null);
        }
    }

    useEffect(() => {
      console.log(letters)
    }, [letters])
    

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
            {/* <Chat /> */}
            <Physics>
                <Plane onPlaneClick={handlePlaneClick} onRightClick={dropObject} />
                <Character targetPosition={targetPosition} onArrival={handleArrival} ref={playerRef} />
                {indicatorPosition && (
                    <mesh position={[indicatorPosition.x, 0, indicatorPosition.z]}>
                        <boxGeometry args={[0.5, 0.1, 0.5]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                )}
                {
                    letters
                        .filter((letter: Letter) => letter.owner === myPlayer()?.id)
                        .map((letter: Letter) => {
                            return (
                                <PickableItem onPickUp={handlePickUp} letter={letter} isAttached={heldObject ? true : false} />
                            )
                        })
                }
                <PostBox onObjectSent={sendLetter} onObjectPut={putObjectInPost} postedObject={postedObject} ref={postBoxRef} />
            </Physics>
            <gridHelper args={[30, 15]} />
            <OrbitControls />
        </>
    );
};

export default Room;
