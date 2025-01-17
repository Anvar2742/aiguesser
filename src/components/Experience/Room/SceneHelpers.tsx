import Walls from "./Walls"

const SceneHelpers = () => {
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
            <gridHelper args={[30, 15]} />
            <Walls />
        </>
    )
}

export default SceneHelpers