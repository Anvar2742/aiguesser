import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Root, Container, Text as TextUI } from "@react-three/uikit"
import { Tween, Easing, Group as TweenGroup } from "@tweenjs/tween.js";
import { myPlayer, PlayerState, usePlayerState } from "playroomkit";
import { useEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import { cameraDefault } from "../utills";
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import useCameraAnimation from "../MyControls";
import usePlayers from "../usePlayers";

type PostBoxScreenProps = {
    toPlayer: PlayerState | null; // The player to send the object
    onObjectSent: (e: ThreeEvent<MouseEvent>, to: string | null) => void; // Callback to inform the parent when the object is sent
    controls: ThreeOrbitControls | null;
    updateToPlayer: (e: ThreeEvent<MouseEvent>, player: PlayerState) => void;
};

const PostBoxScreen: React.FC<PostBoxScreenProps> = ({ onObjectSent, toPlayer, controls, updateToPlayer }) => {
    const tweenGroup = useRef(new TweenGroup());
    const screenRef = useRef<Group>(null);
    const { handleCameraAnimation } = useCameraAnimation()
    const { allPlayersExceptMe } = usePlayers()

    const computerInit = (e: ThreeEvent<MouseEvent> | null = null) => {
        e?.stopPropagation();
        if (!screenRef.current) return
        handleCameraAnimation(controls, screenRef.current, 2)
    };

    useFrame(() => {
        tweenGroup.current.update();
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "KeyW") {
                e.preventDefault()
                computerInit()
            }
        }
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [controls])


    return (

        <group
            position={[0, 2.5, 1.01]}
            ref={screenRef}
        >
            <Root backgroundColor="black" flexDirection={"column"} sizeX={2} sizeY={1.5} padding={15}>
                <Container
                    backgroundColor={"gray"}
                    backgroundOpacity={.9}
                    flexDirection={'column'}
                    justifyContent={"center"}
                    alignItems={"center"}
                    gap={5}
                    padding={20}
                >
                    <Container
                        backgroundOpacity={.9}
                        gap={5}
                        padding={5}
                    >
                        <>
                            {
                                allPlayersExceptMe.map((player: PlayerState) => {
                                    const pAddress = player.getState("postAddress")
                                    return (
                                        <TextUI
                                            onClick={(e) => updateToPlayer(e, player)}
                                            fontSize={4}
                                            key={player.id}
                                            backgroundColor={"white"}
                                            paddingY={5}
                                            paddingX={10}
                                            borderRadius={10}
                                            borderWidth={1}
                                            borderColor={"black"}
                                            hover={{ backgroundOpacity: .9 }}

                                        >
                                            Post address: {pAddress}
                                        </TextUI>
                                    )
                                })
                            }
                        </>
                    </Container>

                    <TextUI
                        onClick={(e) => onObjectSent(e, toPlayer?.id ?? null)}
                        fontSize={6}
                        backgroundColor={"blue"}
                        paddingY={5}
                        paddingX={10}
                        borderRadius={10}
                        borderWidth={2}
                        borderColor={"black"}
                        hover={{ backgroundOpacity: .95 }}
                        marginTop={15}
                        fontWeight={700}
                        color={"white"}
                    >
                        Send Letter
                    </TextUI>
                </Container>

                <Container flexDirection={"column"} justifyContent={"center"} alignItems={"center"} marginTop={15}>
                    {
                        myPlayer().getState("isAlive")
                            ? <TextUI fontSize={6} fontWeight={700} color="white">
                                {`Selected Recipient: ${toPlayer?.getState("postAddress")}`}
                            </TextUI>
                            : <TextUI fontSize={6} fontWeight={700} color="white">
                                {"You're dead. You can't send letters."}
                            </TextUI>
                    }
                </Container>
            </Root>
        </group>
    )
}

export default PostBoxScreen;