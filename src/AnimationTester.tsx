import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';

interface FBXModelProps {
  url: string;
  scale: number;
  togglePlay: boolean;
}

const FBXModel: React.FC<FBXModelProps> = ({ url, scale, togglePlay }) => {
  const group = useRef<THREE.Group>(new THREE.Group());
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const fbxObject = useRef<THREE.Group<THREE.Object3DEventMap> | null>(null);
  const clock = new THREE.Clock();
  
  useEffect(() => {
    console.log(fbxObject)
  }, [fbxObject.current, togglePlay])
  
  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      url,
      (fbx) => {
        fbxObject.current = fbx
        fbx.scale.set(scale, scale, scale);        
        // Adjust model orientation
        fbx.rotation.x = -Math.PI / 2; // Example adjustment for FBX axis mismatch

        group.current.add(fbx);

        // Add SkeletonHelper for debugging
        const skeleton = new THREE.SkeletonHelper(fbx);
        skeleton.visible = true; // Set to false to hide helper
        group.current.add(skeleton);

        // Create AnimationMixer if animations are available
        if (fbx.animations.length > 0) {
          mixer.current = new THREE.AnimationMixer(fbx);
        }
      },
      (xhr) => {
        console.log(`Model ${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`);
      },
      (error) => {
        console.error('An error occurred while loading the model:', error);
      }
    );

    return () => {
      // Clean up mixer
      if (mixer.current) mixer.current.stopAllAction();
    };
  }, [url, scale]);

  useEffect(() => {
    if (mixer.current) {
      const root = mixer.current.getRoot() as THREE.Object3D;
      const action = mixer.current.clipAction(root.animations[0]);
      if (togglePlay) {
        action.play();
      } else {
        action.stop();
      }
    }
  }, [togglePlay]);

  useFrame(() => {
    if (mixer.current) mixer.current.update(clock.getDelta());
  });

  return <group ref={group} />;
};

const AnimationTester: React.FC = () => {
  const [togglePlay, setTogglePlay] = useState(false);

  return (
    <>
      <button
        onClick={() => setTogglePlay((prev) => !prev)}
        style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}
      >
        {togglePlay ? 'Pause Animation' : 'Play Animation'}
      </button>
      <Canvas camera={{ position: [10, 10, 20], fov: 75, near: 0.001 }} style={{ height: "100vh", position: "fixed" }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <OrbitControls enableDamping={true} />
        <FBXModel url="/models/Anim.fbx" scale={1} togglePlay={togglePlay} />
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]} // Rotate the plane to make it horizontal
        >
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="green" />
        </mesh>
      </Canvas>
    </>
  );
};

export default AnimationTester;
