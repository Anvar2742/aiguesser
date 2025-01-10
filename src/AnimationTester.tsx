import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function WorldModel({ path, togglePlay }) {
  const { scene, animations } = useGLTF(path);
  const mixer = useRef(null);
  const clock = useRef(new THREE.Clock());

  useEffect(() => {
    if (animations.length > 0) {
      // Set up AnimationMixer and play the first animation
      mixer.current = new THREE.AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      if (togglePlay) {
        action.play();
      } else {
        action.stop();
      }
    }

    return () => {
      // Clean up the AnimationMixer
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current.uncacheRoot(scene);
      }
    };
  }, [scene, animations, togglePlay]);

  useFrame(() => {
    if (mixer.current) {
      mixer.current.update(clock.current.getDelta());
    }
  });

  return <primitive object={scene} />;
}

function AnimationTester() {
  const [togglePlay, setTogglePlay] = useState(false);

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      {/* Animation Toggle Button */}
      <button
        onClick={() => setTogglePlay((prev) => !prev)}
        style={{
          position: "absolute",
          zIndex: 10,
          top: 20,
          left: 20,
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "white",
          border: "1px solid black",
          cursor: "pointer",
        }}
      >
        {togglePlay ? "Pause Animation" : "Play Animation"}
      </button>

      {/* Canvas and Model */}
      <Canvas gl={{ antialias: true, toneMapping: THREE.NoToneMapping }} linear>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <OrbitControls />
        <WorldModel path="/models/robot.glb" togglePlay={togglePlay} />
      </Canvas>
    </div>
  );
}

export default AnimationTester;

useGLTF.preload("/models/robot.glb");
