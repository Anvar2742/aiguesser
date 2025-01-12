import React, { useState, useRef, useEffect } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Position } from '../utills';
import Character from '../Character';
import Plane from '../Plane';
import PickableItem from '../InteractionSystem/PickableItem';
import PostSystem from '../PostBox/PostSystem';
import { Group, Mesh, SkeletonHelper, Vector3 } from 'three';
import useLetters, { Letter } from '../useLetters';
import { myPlayer, usePlayersList } from 'playroomkit';
import Computer from '../Computer';
import Voting from '../../Game/Voting';
import Walls from './Walls';
import usePlayers from '../usePlayers';
import CanvasUI from '../CanvasUI';
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';

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
    const { playersForGame, allPlayersExceptMe, amISeeker } = usePlayers()
    const controls = useRef<ThreeOrbitControls | null>(null);

    // console.log(playerRef.current?.fbxObject);
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
    const handlePickUp = (item: Mesh | null) => {
        if (!item) return;
        item.position.set(0, 0, 0);

        const handBone = playerRef.current.characterScene.getObjectByName("Cube016");
        if (handBone) {
            handBone.attach(item);
        }

        setHeldObject(item);
        const existingLetter = letters.find((letter: Letter) => letter.uuid === item.uuid);
        if (!existingLetter) return;
        const updatedLetter: Letter = {
            ...existingLetter,
            isInPostBox: false
        };
        updateLetter(updatedLetter, false);
    };

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
        if (!myPlayer().getState("isAlive")) {
            alert("You are dead. You can't send letters.")
            return
        }
        if (heldObject && postBoxRef.current) {
            // Attach the held object to the post box
            postBoxRef.current.attach(heldObject);

            // Position the held object near the post box with an offset
            heldObject.position.copy(new Vector3(0, 1, 0));
            heldObject.updateMatrixWorld(); // Ensure the matrix is updated to reflect the new position
            // console.log(heldObject);

            // Set the held object as posted

            const existingLetter = letters.find((letter: Letter) => letter.uuid === heldObject.uuid)
            if (!existingLetter) return
            const updatedLetter: Letter = {
                ...existingLetter,
                isInPostBox: true
            }
            updateLetter(updatedLetter, false)
            // setPostedObject(heldObject);
            setHeldObject(null)
        }
    };

    /**
     * Send letters
     * @param e ThreeEvent<MouseEvent>
     */
    const sendLetter = (e: ThreeEvent<MouseEvent>, to: string | null) => {
        e.stopPropagation()

        if (postedObject?.userData.msg.length === 0) {
            alert("Letter empty")
            return
        }
        if (to === null) {
            alert("No recipient selected")
            return
        }

        if (!myPlayer()?.getState("isAlive")) {
            alert("You are dead. You can't send letters.")
            return
        }

        if (amISeeker) {
            const recipientPlayer = allPlayersExceptMe.find(player => player.id === to)
            if (!recipientPlayer?.getState("isAlive")) {
                alert("You killed this recipient.")
                return
            }
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
                isInPostBox: true
            }
            updateLetter(updatedLetter, true)
            const toPlayer = playersForGame.find(player => player.id === to)
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

    useEffect(() => {
        if (playerRef.current && playerRef.current.characterScene) {
            const skeletonHelper = new SkeletonHelper(playerRef.current.characterScene);
            scene.add(skeletonHelper);

            return () => {
                scene.remove(skeletonHelper);
            };
        }
    }, [scene]);

    return (
        <>
            <ambientLight intensity={1} />
            <group position={[0, 10, 5]}>
                <directionalLight
                    position={[0, 0, 0]}
                    intensity={.5}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <mesh
                    position={[0, 0, 0]}
                    receiveShadow
                    rotation={[0, 0, 0]} // Rotate the plane to make it horizontal
                    onClick={(e) => e.stopPropagation()}
                >
                    <sphereGeometry args={[.5, 16, 16]} />
                    <meshStandardMaterial color="white" metalness={.1} roughness={.1} />
                </mesh>
            </group>
            <Walls />
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
                                <PickableItem onPickUp={handlePickUp} letter={letter} isAttached={heldObject ? true : false} key={letter.uuid} setPostLetter={setPostedObject} />
                            )
                        })
                }
                <PostSystem onObjectSent={sendLetter} onObjectPut={putObjectInPost} postedObject={postedObject} ref={postBoxRef} controls={controls.current} />
                <Computer controls={controls.current} />
                <Voting />
            </Physics>
            <CanvasUI />
            <OrbitControls ref={controls}
                // minAzimuthAngle={-Math.PI * .05} maxAzimuthAngle={Math.PI * .05} minPolarAngle={Math.PI * .35} maxPolarAngle={Math.PI * .42}
            />
            <gridHelper args={[30, 15]} />
        </>
    );
};

export default Room;
