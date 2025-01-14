import { myPlayer } from "playroomkit";

type PostBoxProps = {
    postedObject: any | null; // The object that is in the post box
};


const PostBox: React.FC<PostBoxProps> = ({ postedObject }) => {
    return (
        <>
            <mesh
                position={[0, 2, 0]}
                castShadow
                receiveShadow
                name='post-box'
            >
                <boxGeometry args={[2, 4, 2]} />
                <meshStandardMaterial color={myPlayer().getState("isAlive") ? "yellow" : "red"} />
            </mesh>
            <mesh
                // onClick={(e) => onObjectSent(e, toPlayer?.id ?? null)}
                castShadow
                receiveShadow
                position={[0, 3.5, 1.1]}
            >
                <boxGeometry args={[.2, .2, .2]} />
                <meshStandardMaterial
                    color={postedObject ? "green" : "#d00000"}
                    metalness={.4}
                    roughness={.1}
                    emissive={postedObject ? "green" : "#d00000"}
                    emissiveIntensity={1}
                />
                <pointLight
                    color={postedObject ? "green" : "#d00000"}
                    intensity={1}
                    distance={.5}
                    decay={2}
                />
            </mesh>

            {/* Render the posted object */}
            {postedObject && (
                <primitive object={postedObject} />
            )}
        </>
    )
}

export default PostBox