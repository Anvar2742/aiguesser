import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import Chat from './Chat';
import { Position } from './utills';
import Character from './Character';
import Plane from './Plane';
import { PlayerState } from 'playroomkit';
import PickableItem from './InteractionSystem/PickableItem';

type RoomProps = {
    player: PlayerState
};

const Room: React.FC<RoomProps> = ({ player }) => {
    const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, z: 3 });
    const [indicatorPosition, setIndicatorPosition] = useState<Position | null>(null);
    const playerRef = useRef<any>();


    const handlePlaneClick = (position: Position) => {
        setTargetPosition(position);
        setIndicatorPosition(position);
    };

    const handleArrival = () => {
        setIndicatorPosition(null);
    };

    const handlePickUp = (item: { current: any; }) => {
        console.log(item);
        item.current.position.set(0, 0, 0)
        playerRef.current.fbxObject.getObjectByName("mixamorigRightHand")?.attach(item.current)
    }
    

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
                <PickableItem onPickUp={handlePickUp} />
            </Physics>
            <gridHelper args={[30, 15]} />
        </Canvas>
    );
};

export default Room;
