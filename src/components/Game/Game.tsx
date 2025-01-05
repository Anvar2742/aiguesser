import { onPlayerJoin, insertCoin, PlayerState, useMultiplayerState, myPlayer, isHost } from "playroomkit";
import { useEffect, useState } from "react";
import Room from "../Experience/Room";
import { Canvas } from "@react-three/fiber";
import useLetters, { Letter } from "../Experience/useLetters";
import { Mesh } from "three";

const Game = () => {
    const [players, setPlayers] = useState<PlayerState[]>([]);
    const [status, setStatus] = useMultiplayerState('status', 0);
    const { letters, addLetter } = useLetters();

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
        if (isHost()) {
            setStatus(1, true)
        }
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



    const init = () => {
        if (isHost()) {
            assignRoles(players);
            setStatus(2, true);
            if (letters.length === 0) {
                players.forEach((player: PlayerState) => {
                    if (player.getState('role') === 'seeker') {
                        const letterMesh = new Mesh()
                        letterMesh.name = "Letter"
                        const initLetter: Letter = {
                            owner: player.id,
                            from: player.id,
                            to: null,
                            msg: "",
                            mesh: letterMesh // Initialize mesh with a new Mesh instance
                        };
                        addLetter(initLetter);
                    }
                });
            }
        }
    };


    useEffect(() => {
        start();
    }, []);

    useEffect(() => {
        if (players.length && status === 1 && isHost()) {
            init()
        }
    }, [players]);
    console.log(status);

    if (status === 1) return
    return (
        <>
            <p className="fixed top-0 left-0 bg-slate-800 text-white p-2">{myPlayer()?.id}</p>
            <Canvas style={{ height: "100vh", position: "fixed", top: "0", left: "0" }} shadows camera={{ position: [0, 7, 15], fov: 40 }}>
                <Room />
            </Canvas>
        </>
    );
};

export default Game;
