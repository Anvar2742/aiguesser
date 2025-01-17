import { useContext, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { Tween, Easing, Group as TweenGroup } from "@tweenjs/tween.js";
import { cameraDefault } from "./utills";
import { Context } from "../../Context";

// GOTTA GET BACK AND FIX THIS PILE OF GARBAGE
const useCameraAnimation = () => {
    const tweenGroup = useRef(new TweenGroup());
    const { camera } = useThree();
    const contextControls = useContext(Context);
    const cachedControls = useRef(contextControls);
    useEffect(() => {
        cachedControls.current = contextControls;
    }, [contextControls]);

    // Method to animate the camera
    const handleCameraAnimation = (
        target: Group | null,
        offsetZ: number = 4.5,
        isDefault: boolean = false
    ) => {
        const currentControls = cachedControls.current;

        if (!currentControls) return;

        const targetPosition = new Vector3();
        const adjustedTarget = new Vector3();

        currentControls.enabled = true
        if (isDefault) {
            // Reset to default camera and lookAt position
            const defaultCameraPosition = new Vector3(cameraDefault.position[0], cameraDefault.position[1], cameraDefault.position[2]); // Adjust these to your default camera position
            const defaultLookAt = new Vector3(0, 0, 0);

            // Tween for camera target
            const tweenTarget = new Tween(currentControls.target)
                .to(
                    {
                        x: defaultLookAt.x,
                        y: defaultLookAt.y,
                        z: defaultLookAt.z,
                    },
                    750
                )
                .onUpdate(() => {
                    currentControls.enabled = true
                })
                .easing(Easing.Cubic.Out)
                .start();
            tweenGroup.current.add(tweenTarget);

            // Tween for camera position
            const tweenPos = new Tween(camera.position)
                .to(
                    {
                        x: defaultCameraPosition.x,
                        y: defaultCameraPosition.y,
                        z: defaultCameraPosition.z,
                    },
                    750
                )
                .onUpdate(() => {
                    currentControls.enabled = true
                })
                .easing(Easing.Cubic.Out)
                .start();
            tweenGroup.current.add(tweenPos);
        } else if (target) {
            // Get the target object's world position
            target.getWorldPosition(targetPosition);

            adjustedTarget.copy(targetPosition)

            // Tween for target rotation
            const tweenTarget = new Tween(currentControls.target)
                .to(
                    {
                        x: adjustedTarget.x,
                        y: adjustedTarget.y,
                        z: adjustedTarget.z,
                    },
                    750
                )
                .onUpdate(() => {
                    currentControls.enabled = true
                })
                .easing(Easing.Cubic.Out)
                .start();
            tweenGroup.current.add(tweenTarget);

            // Optionally adjust camera position relative to the target
            adjustedTarget.add(new Vector3(0, 0, offsetZ));

            // Tween for camera position
            const tweenPos = new Tween(camera.position)
                .to(
                    {
                        x: adjustedTarget.x,
                        y: adjustedTarget.y,
                        z: adjustedTarget.z,
                    },
                    750
                )
                .onEveryStart(() => {
                    currentControls.enabled = true
                })
                .onUpdate(() => {
                    currentControls.enabled = true
                })
                .onComplete(() => {
                    currentControls.enabled = false
                })
                .easing(Easing.Cubic.Out)
                .start();
            tweenGroup.current.add(tweenPos);
        }
    };


    // Update tweens in the frame loop
    useFrame(() => {
        tweenGroup.current.update();
    });

    return { handleCameraAnimation };
}

export default useCameraAnimation;
