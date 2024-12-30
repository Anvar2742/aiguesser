import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import Chat from './Chat';
import { Position } from './utills';
import Character from './Character';
import Plane from './Plane';
import PickableItem from './PickableItem';


const TheRoom: React.FC = () => {
    const [targetPosition, setTargetPosition] = useState<Position>({ x: 0, z: 3 });
    const [indicatorPosition, setIndicatorPosition] = useState<Position | null>(null);
    const playerRef = useRef<any>();
    const [attachedItem, setAttachedItem] = useState<any>(null);

    const handlePlaneClick = (position: Position) => {
        setTargetPosition(position);
        setIndicatorPosition(position);
    };

    const handleArrival = () => {
        setIndicatorPosition(null);
    };

    const handlePickup = (e) => {
        console.log("pick up", e)
        setAttachedItem(e.object)
    }

    return (
        <Canvas style={{ height: "100vh", position: "fixed", top: "0", left: "0" }} shadows camera={{ position: [0, 7, 15], fov: 40 }}>
            <ambientLight intensity={0.5} />
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
                <Character targetPosition={targetPosition} onArrival={handleArrival} playerRef={playerRef} />
                {indicatorPosition && (
                    <mesh position={[indicatorPosition.x, 0, indicatorPosition.z]}>
                        <boxGeometry args={[0.5, 0.1, 0.5]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                )}
                <PickableItem onPickUp={handlePickup} playerRef={playerRef} attachedItem={attachedItem} />
            </Physics>
            <gridHelper args={[30, 15]} />
        </Canvas>
    );
};

export default TheRoom;
