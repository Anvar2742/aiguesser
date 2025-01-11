import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Group } from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { isHost, myPlayer, PlayerState, useMultiplayerState } from 'playroomkit';
import { Container, Fullscreen, Root, Text as TextUI } from '@react-three/uikit';
import usePlayers from '../usePlayers';
import PostBox from './PostBox';
import PostBoxScreen from './PostBoxScreen';
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';

type PostProps = {
    onObjectPut: (e: ThreeEvent<MouseEvent>) => void; // Callback to inform the parent when the object is sent
    onObjectSent: (e: ThreeEvent<MouseEvent>, to: string | null) => void; // Callback to inform the parent when the object is sent
    postedObject: any | null; // The object that is in the post box
    controls: ThreeOrbitControls | null;
};

const PostSystem = forwardRef<any, PostProps>(({ onObjectSent, onObjectPut, postedObject, controls }, ref) => {
    const postBoxRef = useRef<Group>(null);
    const [toPlayer, setToPlayer] = useState<PlayerState | null>(null)
    const [isChossingRecipient, setIsChossingRecipient] = useState(false)
    const { allPlayersExceptMe, players, amISeeker } = usePlayers()

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
            <PostBox
                postedObject={postedObject}
                toPlayer={toPlayer}
                onObjectSent={onObjectSent}
            />
            <PostBoxScreen
                toPlayer={toPlayer}
                onObjectSent={onObjectSent}
                controls={controls}
                updateToPlayer={updateToPlayer}
            />
            <Fullscreen>
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

export default PostSystem;
