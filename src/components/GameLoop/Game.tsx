import { onPlayerJoin, insertCoin, isHost, myPlayer, Joystick, PlayerState } from "playroomkit";
import { useEffect, useState } from "react";

const Game = () => {
    const [players, setPlayers] = useState<PlayerState[]>([]);

    const start = async () => {
        // Start the game
        await insertCoin();

        // Create a joystick controller for each joining player
        onPlayerJoin((state: PlayerState) => {
            state.setState("letters", 0);
            setPlayers((players) => [...players, state]);
            state.onQuit(() => {
                setPlayers((players) => players.filter((p) => p.id !== state.id));
            });
        });
    };

    useEffect(() => {
        start();
    }, []);

    useEffect(() => {
        console.log(players);
    }, [players]);

    return (
        <>
            {players.map((player) => (
                <div key={player.id}>
                    {player.getProfile().name}
                </div>
            ))}
        </>
    );
};

export default Game;
