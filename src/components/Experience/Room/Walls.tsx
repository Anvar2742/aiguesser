const Walls = () => {
    const wallSize = 18
    return (
        <group position={[0, 0, -2]}>
            {/* Right */}
            <mesh
                receiveShadow
                position={[-wallSize / 2, wallSize / 2, wallSize / 2]}
                rotation={[0, Math.PI / 2, 0]}
                onClick={(e) => e.stopPropagation()}
            >
                <planeGeometry args={[wallSize, wallSize]} />
                <meshStandardMaterial color="white" metalness={.1} roughness={.1} />
            </mesh>
            {/* Front */}
            <mesh
                receiveShadow
                position={[0, wallSize / 2, 0]}
                rotation={[0, 0, 0]}
                onClick={(e) => e.stopPropagation()}
            >
                <planeGeometry args={[wallSize, wallSize]} />
                <meshStandardMaterial color="red" metalness={.1} roughness={.1} />
            </mesh>
            {/* Left */}
            <mesh
                receiveShadow
                position={[wallSize / 2, wallSize / 2, wallSize / 2]}
                rotation={[0, -Math.PI / 2, 0]}
                onClick={(e) => e.stopPropagation()}
            >
                <planeGeometry args={[wallSize, wallSize]} />
                <meshStandardMaterial color="white" metalness={.1} roughness={.1} />
            </mesh>
        </group>
    )
}

export default Walls