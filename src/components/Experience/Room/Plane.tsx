import { RigidBody } from "@react-three/rapier";
import { Position } from "../helpers/utills";

type PlaneProps = {
    onPlaneClick: (position: Position) => void;
    onRightClick: (e: any) => void;
};

const Plane: React.FC<PlaneProps> = ({ onPlaneClick, onRightClick }) => {
    return (
        <RigidBody type="fixed" colliders={"cuboid"}>
            <mesh
                receiveShadow
                rotation={[-Math.PI / 2, 0, 0]} // Rotate the plane to make it horizontal
                onClick={(e) => {
                    const [x, , z] = e.point.toArray();
                    onPlaneClick({ x, z });
                }}
                onContextMenu={onRightClick}
            >
                <planeGeometry args={[30, 30]} />
                <meshStandardMaterial color="green" />
            </mesh>
        </RigidBody>
    );
};

export default Plane;