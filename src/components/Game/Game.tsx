import { onPlayerJoin, insertCoin, PlayerState, useMultiplayerState, myPlayer } from "playroomkit";
import { useEffect, useState } from "react";
import Room from "../Experience/Room";

const Game = () => {
    const [players, setPlayers] = useState<PlayerState[]>([]);
    const [status, setStatus] = useMultiplayerState('status', 0);

    const assignRoles = (players: PlayerState[]) => {
        if (players.length > 0) {
            // Randomly select one player as the seeker (detective)
            const seekerIndex = Math.floor(Math.random() * players.length);
            players.forEach((player, index) => {
                player.setState("role", index === seekerIndex ? "seeker" : "hider");
            });
        }
    };

    const onLaunch = () => {
        setStatus(1, true)
    };

    const start = async () => {
        // Start the game
        await insertCoin({}, onLaunch);

        // Create a joystick controller for each joining player
        onPlayerJoin((state: PlayerState) => {
            setPlayers((players) => {
                const updatedPlayers = [...players, state];
                return updatedPlayers;
            });
            state.onQuit(() => {
                setPlayers((players) => players.filter((p) => p.id !== state.id));
            });
        });
    };

    useEffect(() => {
        start();
    }, []);

    useEffect(() => {
        if (players.length && status === 1) {
            assignRoles(players)
            setStatus(2, true)
        }
    }, [players]);

    if (status === 1) return
    return (
        <Room player={myPlayer()} />
    );
};

export default Game;
