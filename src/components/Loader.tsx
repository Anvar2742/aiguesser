import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh } from "three";

const Loader = () => {
    const meshRef = useRef<Mesh>(null); // Reference to the mesh

    // Animate rotation on each frame
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" metalness={.2} roughness={.2} />
        </mesh>
    );
};

export default Loader;