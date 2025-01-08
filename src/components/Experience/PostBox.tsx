import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Color, Group } from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { myPlayer, PlayerState, usePlayersList } from 'playroomkit';

type PostBoxProps = {
    onObjectPut: (e: ThreeEvent<MouseEvent>) => void; // Callback to inform the parent when the object is sent
    onObjectSent: (e: ThreeEvent<MouseEvent>, to: string | null) => void; // Callback to inform the parent when the object is sent
    postedObject: any | null; // The object that is in the post box
};

const PostBox = forwardRef<any, PostBoxProps>(({ onObjectSent, onObjectPut, postedObject }, ref) => {
    const postBoxRef = useRef<Group>(null);
    const [toPlayer, setToPlayer] = useState<PlayerState | null>(null)
    const players = usePlayersList();
    const [isChossingRecipient, setIsChossingRecipient] = useState(false)

    // Expose the local ref to the parent component through the forwarded ref
    useImperativeHandle(ref, () => postBoxRef.current);

    useFrame(() => {
        if (postBoxRef.current) {
            postedObject?.position.set(0, 1, 0);
        }
    })

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
            position={[3, .5, 6]}
            ref={postBoxRef}
            onContextMenu={onObjectPut}
        >
            <mesh
                castShadow
                receiveShadow
                name='post-box'
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="yellow" />
                <Text fontSize={0.25} color="black" position={[0, 0, .55]}>
                    {toPlayer?.getState("postAddress")}
                </Text>
            </mesh>
            <mesh
                onClick={(e) => onObjectSent(e, toPlayer?.id ?? null)}
                castShadow
                receiveShadow
                position={[.75, .25, .25]}
            >
                <boxGeometry args={[.5, .5, .5]} />
                <meshStandardMaterial color="red" />
            </mesh>

            {/* Render the posted object */}
            {postedObject && (
                <primitive object={postedObject} />
            )}

            {
                isChossingRecipient && (
                    <>
                        {players
                            .filter((player: PlayerState) => player.id !== myPlayer().id)
                            .map((player: PlayerState, i: number) => {
                                return (
                                    <mesh
                                        onClick={(e) => updateToPlayer(e, player)}
                                        castShadow
                                        receiveShadow
                                        position={[1 + i, 1, 1]}
                                        key={player.id}
                                    >
                                        <boxGeometry args={[.5, .5, .5]} />
                                        <meshStandardMaterial color={player.getProfile().color as unknown as Color} />
                                        <Text fontSize={0.25} color="black" position={[0, 0, .26]}>
                                            {player.getState("postAddress")}
                                        </Text>
                                    </mesh>
                                )
                            })
                        }
                    </>
                )
            }
        </group>
    );
});

export default PostBox;
