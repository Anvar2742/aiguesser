import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Group } from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { isHost, myPlayer, PlayerState, useMultiplayerState } from 'playroomkit';
import { Container, Fullscreen, Root, Text as TextUI } from '@react-three/uikit';
import usePlayers from './usePlayers';

type PostBoxProps = {
    onObjectPut: (e: ThreeEvent<MouseEvent>) => void; // Callback to inform the parent when the object is sent
    onObjectSent: (e: ThreeEvent<MouseEvent>, to: string | null) => void; // Callback to inform the parent when the object is sent
    postedObject: any | null; // The object that is in the post box
};

const PostBox = forwardRef<any, PostBoxProps>(({ onObjectSent, onObjectPut, postedObject }, ref) => {
    const postBoxRef = useRef<Group>(null);
    const [toPlayer, setToPlayer] = useState<PlayerState | null>(null)
    const [isChossingRecipient, setIsChossingRecipient] = useState(false)
    const [isRestart, setIsRestart] = useState(false)
    const { allPlayersExceptMe, players, amISeeker, playersForGame } = usePlayers()

    const [, setStatus] = useMultiplayerState<number>('status', 0);

    // Expose the local ref to the parent component through the forwarded ref
    useImperativeHandle(ref, () => postBoxRef.current);

    useFrame(() => {
        if (postBoxRef.current) {
            postedObject?.position.set(-1.1, 1, 0);
        }
    })

    useEffect(() => {
        if (!toPlayer && amISeeker) {
            setToPlayer(allPlayersExceptMe[0])
        }
    }, [])


    /**
     * Handle the key press event
     * Set the recipient as seeker for the hiders
     */
    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "e") {
                e.preventDefault()
                setIsChossingRecipient((prev) => !prev)
            }
        }

        if (myPlayer().getState("role") === "seeker") {
            window.addEventListener("keydown", handleKeyDown)
        } else if (!toPlayer) {
            const seekerPlayer = players.find((p: PlayerState) => p.getState("role") === "seeker")
            if (!seekerPlayer) return
            setToPlayer(seekerPlayer)
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isChossingRecipient, toPlayer, postedObject])


    /**
     * Handle the key press event
     * Set the recipient as seeker for the hiders
     */
    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "KeyM") {
                e.preventDefault()
                setIsRestart((prev) => !prev)
            }
        }

        if (isHost()) {
            window.addEventListener("keydown", handleKeyDown)
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isRestart])

    const updateToPlayer = (e: ThreeEvent<MouseEvent>, player: PlayerState) => {
        e.stopPropagation()
        if (player) {
            setToPlayer(player)
        }
    }


    return (
        <group
            position={[4.4, 0, 6]}
            ref={postBoxRef}
            onContextMenu={onObjectPut}
        >
            <mesh
                position={[0, 2, 0]}
                castShadow
                receiveShadow
                name='post-box'
            >
                <boxGeometry args={[2, 4, 2]} />
                <meshStandardMaterial color={myPlayer().getState("isAlive") ? "yellow" : "red"} />
                <group position={[0, 0, 1.01]}>
                    <Root backgroundColor="white" sizeX={2} sizeY={1} padding={15}>
                        <Container flexDirection={"column"} justifyContent={"center"} >
                            {
                                myPlayer().getState("isAlive")
                                    ? <TextUI fontSize={20} fontWeight={700} color="black">
                                        {`Recipient: ${toPlayer?.getState("postAddress")}`}
                                    </TextUI>
                                    : <TextUI fontSize={20} fontWeight={700} color="black">
                                        {"You're dead. You can't send letters."}
                                    </TextUI>
                            }
                        </Container>
                    </Root>
                </group>
            </mesh>
            <mesh
                onClick={(e) => onObjectSent(e, toPlayer?.id ?? null)}
                castShadow
                receiveShadow
                position={[0, 1, 1.1]}
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

            <Fullscreen>
                {
                    isRestart && isHost() &&
                    <Container
                        positionType="absolute"
                        positionBottom={0}
                        positionLeft={0}
                        backgroundColor={"gray"}
                        backgroundOpacity={.9}
                        flexDirection={'column'}
                        gap={5}
                        padding={20}
                    >
                        <TextUI
                            onClick={(e) => {
                                e.stopPropagation()
                                setStatus(4, true)
                            }}
                            fontSize={24}
                            backgroundColor={"white"}
                            paddingY={10}
                            paddingX={20}
                            borderRadius={10}
                            borderWidth={5}
                            borderColor={"red"}
                        >
                            Restart game
                        </TextUI>
                    </Container>
                }
                {
                    !isChossingRecipient && myPlayer().getState("isAlive") && (
                        <Container
                            positionType="absolute"
                            positionBottom={0}
                            positionRight={0}
                            backgroundColor={"gray"}
                            backgroundOpacity={.9}
                            flexDirection={'column'}
                            gap={5}
                            padding={20}
                        >
                            <TextUI
                                onClick={(e) => onObjectSent(e, toPlayer?.id ?? null)}
                                fontSize={24}
                                backgroundColor={"white"}
                                paddingY={10}
                                paddingX={20}
                                borderRadius={10}
                                borderWidth={5}
                                borderColor={"black"}
                                hover={{ backgroundOpacity: .9 }}>
                                Send Letter
                            </TextUI>
                        </Container>
                    )
                }
                {
                    isChossingRecipient && myPlayer().getState("isAlive") && (
                        <Container
                            positionType="absolute"
                            positionBottom={0}
                            positionRight={0}
                            backgroundColor={"gray"}
                            backgroundOpacity={.9}
                            flexDirection={'column'}
                            gap={5}
                            padding={20}
                        >
                            <>
                                {
                                    allPlayersExceptMe.map((player: PlayerState) => {
                                        // console.log(player.getState("postAddress"));
                                        const i: string = player.getState("postAddress")
                                        return (
                                            <TextUI
                                                onClick={(e) => updateToPlayer(e, player)}
                                                fontSize={24}
                                                key={player.id}
                                                backgroundColor={"white"}
                                                paddingY={10}
                                                paddingX={20}
                                                borderRadius={10}
                                                borderWidth={5}
                                                borderColor={"black"}
                                                hover={{ backgroundOpacity: .9 }}

                                            >
                                                Post address: {i}
                                            </TextUI>
                                        )
                                    })
                                }
                            </>
                        </Container>
                    )
                }
            </Fullscreen>
        </group>
    );
});

export default PostBox;
