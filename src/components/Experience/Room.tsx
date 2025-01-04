import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import Chat from './Chat';
import { Position } from './utills';
import Character from './Character';
import Plane from './Plane';
import { PlayerState } from 'playroomkit';
import PickableItem from './InteractionSystem/PickableItem';
import PostBox from './PostBox';
import { Mesh } from 'three';
import { OrbitControls } from '@react-three/drei';
import useLetters from './useLetters';

type RoomProps = {
    player: PlayerState
};

const Room: React.FC<RoomProps> = ({ player }) => {
    const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, z: 3 });
    const [indicatorPosition, setIndicatorPosition] = useState<Position | null>(null);
    const playerRef = useRef<any>();
    const [heldObject, setHeldObject] = useState(null)
    const [postedObject, setPostedObject] = useState<Mesh | null>(null);
    const { letters, addLetter, updateLetter } = useLetters();

    const handlePlaneClick = (position: Position) => {
        setTargetPosition(position);
        setIndicatorPosition(position);
    };

    const handleArrival = () => {
        setIndicatorPosition(null);
    };

    const handlePickUp = (item: { current: any; }) => {
        item.current.position.set(0, 0, 0)
        playerRef.current.fbxObject.getObjectByName("mixamorigRightHand")?.attach(item.current)
        setHeldObject(item.current)
        setPostedObject(null)
    }

    const handleObjectSent = (e: any) => {
        e.stopPropagation()
        // console.log(heldObject);
        addLetter(heldObject)
    }

    useEffect(() => {
        console.log(letters);
    }, [letters])



    return (
        <Canvas style={{ height: "100vh", position: "fixed", top: "0", left: "0" }} shadows camera={{ position: [0, 7, 15], fov: 40 }}>
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
                <Plane onPlaneClick={handlePlaneClick} />
                <Character targetPosition={targetPosition} onArrival={handleArrival} ref={playerRef} />
                {indicatorPosition && (
                    <mesh position={[indicatorPosition.x, 0, indicatorPosition.z]}>
                        <boxGeometry args={[0.5, 0.1, 0.5]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                )}
                {letters.map(letter => {
                    return (
                        <PickableItem onPickUp={handlePickUp}  />
                    )
                })}
                <PickableItem onPickUp={handlePickUp} />
                <PostBox heldObject={heldObject} onObjectSent={handleObjectSent} postedObject={postedObject} setPostedObject={setPostedObject} />
            </Physics>
            <gridHelper args={[30, 15]} />
            <OrbitControls />
        </Canvas>
    );
};

export default Room;
