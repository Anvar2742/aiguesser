import React, { useState, useRef, useEffect } from 'react';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Position } from '../helpers/utills';
import Character from '../CharacterController/Character';
import Plane from './Plane';
import PickableItem from '../CharacterController/PickableItem';
import PostSystem from '../PostSystem/PostSystem';
import { Group } from 'three';
import useLetters, { Letter } from '../helpers/useLetters';
import { myPlayer } from 'playroomkit';
import Computer from '../Computer/Computer';
import Voting from '../Game/Voting';
import CanvasUI from '../Game/CanvasUI';
import { OrbitControls } from '@react-three/drei';
import { Context } from '../../Context';
import useLetterInteractions from '../helpers/useLetterInteractions';
import SceneHelpers from './SceneHelpers';

const Room: React.FC = () => {
    const controls = useRef(null)
    // Position & Movement
    const playerRef = useRef<any>();
    const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, z: 5 });
    const [indicatorPosition, setIndicatorPosition] = useState<Position | null>(null);

    // Post box
    const postBoxRef = useRef<Group>(null);

    // Multiplayer (all letters & players)
    const { letters } = useLetters();
    const {
        handlePickUp,
        dropObject,
        putObjectInPost,
        sendLetter,
        heldObject,
        postedObject,
        setPostedObject
    } = useLetterInteractions(playerRef, postBoxRef);

    // Update targetPosition & indicatorPosition
    const handlePlaneClick = (position: Position) => {
        setTargetPosition(position);
        setIndicatorPosition(position);
    };

    // Event when player arrived
    const handleArrival = () => {
        setIndicatorPosition(null);
    };

    return (
        <Context.Provider value={controls.current}>
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
                <PostSystem onObjectSent={sendLetter} onObjectPut={putObjectInPost} postedObject={postedObject} ref={postBoxRef} />
                <Computer />
                <Voting />
            </Physics>
            <CanvasUI />
            <OrbitControls ref={controls}
            // minAzimuthAngle={-Math.PI * .05} maxAzimuthAngle={Math.PI * .05} minPolarAngle={Math.PI * .35} maxPolarAngle={Math.PI * .42}
            />
            <SceneHelpers />
        </Context.Provider>
    );
};

export default Room;
