import React, { useState, useRef, useEffect } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Position } from './utills';
import Character from './Character';
import Plane from './Plane';
import PickableItem from './InteractionSystem/PickableItem';
import PostBox from './PostBox';
import { Group, Mesh, Vector3 } from 'three';
import useLetters, { Letter } from './useLetters';
import { myPlayer, usePlayersList } from 'playroomkit';
import Computer from './Computer';

const Room: React.FC = () => {
    // Position & Movement
    const playerRef = useRef<any>();
    const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, z: 5 });
    const [indicatorPosition, setIndicatorPosition] = useState<Position | null>(null);

    // Interaction
    const [heldObject, setHeldObject] = useState<Mesh | null>(null)

    // Post box
    const [postedObject, setPostedObject] = useState<Mesh | null>(null);
    const postBoxRef = useRef<Group>(null);

    // Multiplayer (all letters & players)
    const { letters, updateLetter, sendGptLetter } = useLetters();
    const { scene } = useThree()
    const players = usePlayersList()

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

        if (heldObject && postBoxRef.current) {
            // Attach the held object to the post box
            postBoxRef.current.attach(heldObject);

            // Position the held object near the post box with an offset
            heldObject.position.copy(new Vector3(0, 1, 0));
            heldObject.updateMatrixWorld(); // Ensure the matrix is updated to reflect the new position
            // console.log(heldObject);

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

        if (to === null) {
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
                position: postedObject.getWorldPosition(new Vector3()),
                msg: postedObject.userData.msg,
            }
            updateLetter(updatedLetter, true)
            const toPlayer = players.find(player => player.id === to)
            // @ts-ignore
            if (toPlayer?.isBot()) {
                sendGptLetter(updatedLetter)
            }

            // Set the posted object as null
            setPostedObject(null);
        }
    }


    /**
     * Update the message of the letter mesh
     * @param msg string
     */
    const updateLetterMessage = (msg: string) => {
        if (heldObject) {
            // heldObject.userData.msg = msg
            const existingLetter = letters.find((letter: Letter) => letter.uuid === heldObject.uuid)
            if (!existingLetter) return
            const updatedLetter: Letter = {
                ...existingLetter,
                msg: msg,
            }
            updateLetter(updatedLetter, false)
        }
    }

    //**
    // Add Tab press event
    // Prompt for new message
    // Update message
    //  */
    useEffect(() => {
        // console.log(heldObject)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                e.preventDefault()
                if (heldObject) {
                    const msg = prompt("Enter the message", heldObject.userData.msg)
                    if (msg) {
                        updateLetterMessage(msg)
                    }
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [heldObject])

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
                <group>
                    <mesh
                        receiveShadow
                        rotation={[0, 0, 0]} // Rotate the plane to make it horizontal
                        onClick={(e) => e.stopPropagation()}
                    >
                        <planeGeometry args={[30, 30]} />
                        <meshStandardMaterial color="gray" />
                    </mesh>
                    <mesh
                        receiveShadow
                        position={[6, 0, 0]}
                        rotation={[0, -Math.PI / 2, 0]} // Rotate the plane to make it horizontal
                        onClick={(e) => e.stopPropagation()}
                    >
                        <planeGeometry args={[30, 30]} />
                        <meshStandardMaterial color="gray" />
                    </mesh>
                    <mesh
                        receiveShadow
                        position={[-6, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]} // Rotate the plane to make it horizontal
                        onClick={(e) => e.stopPropagation()}
                    >
                        <planeGeometry args={[30, 30]} />
                        <meshStandardMaterial color="gray" />
                    </mesh>
                </group>
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
                                <PickableItem onPickUp={handlePickUp} letter={letter} isAttached={heldObject ? true : false} key={letter.uuid} />
                            )
                        })
                }
                <PostBox onObjectSent={sendLetter} onObjectPut={putObjectInPost} postedObject={postedObject} ref={postBoxRef} />
                <Computer />
            </Physics>
            <gridHelper args={[30, 15]} />
        </>
    );
};

export default Room;
