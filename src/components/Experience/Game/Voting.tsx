import { Fullscreen, Container, Text as TextUI } from "@react-three/uikit";
import { PlayerState, useMultiplayerState } from "playroomkit";
import { useEffect, useState } from "react";
import usePlayers from "../helpers/usePlayers";
import { ThreeEvent } from "@react-three/fiber";
import { PlayerStatus } from "./Game";

const Voting = () => {
    const [isVoting, setIsVoting] = useState(false)
    const { allPlayersExceptMe, amISeeker } = usePlayers()
        const [roles, setRoles] = useMultiplayerState<PlayerStatus[]>('roles', []);

    useEffect(() => {
        const handleVotingWindow = (e: KeyboardEvent) => {
            if (e.code === "KeyV" && amISeeker) {
                e.preventDefault()
                setIsVoting(prev => !prev)
            }
        }

        window.addEventListener("keydown", handleVotingWindow)

        return () => {
            window.removeEventListener("keydown", handleVotingWindow)
        }
    }, [isVoting])

    const handleVote = (e: ThreeEvent<MouseEvent>, player: PlayerState) => {
        e.stopPropagation()
        // console.log(player);
        player.setState("isAlive", false)
        setRoles(roles.map((role: PlayerStatus) => {
            return {
                ...role,
                isAlive: false
            }
        }))
    }

    return (

        <Fullscreen>
            {
                isVoting && (
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
                                            onClick={(e) => handleVote(e, player)}
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
                                            Player {i} is A BOT
                                        </TextUI>
                                    )
                                })
                            }
                        </>
                    </Container>
                )
            }
        </Fullscreen>
    );
};

export default Voting;
