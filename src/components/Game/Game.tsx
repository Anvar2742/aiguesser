import { onPlayerJoin, insertCoin, PlayerState, useMultiplayerState, myPlayer, isHost, Bot } from "playroomkit";
import { useEffect, useRef, useState } from "react";
import Room from "../Experience/Room";
import { Canvas } from "@react-three/fiber";
import useLetters, { Letter } from "../Experience/useLetters";
import { Mesh, Vector3 } from "three";
import Loader from "../Loader";

const Game = () => {
    const playersRef = useRef<PlayerState[]>([]);
    const [players, setPlayers] = useState<PlayerState[]>([]);
    const [status, setStatus] = useMultiplayerState<number>('status', 0);
    const [roles, setRoles] = useMultiplayerState<any>('roles', []);
    const [loading, setLoading] = useState(true);
    const { letters, addLetter } = useLetters();




    const onLaunch = () => {
        if (isHost()) {
            if (roles.length === 0) {
                assignRoles(playersRef.current);
                setStatus(2, true);
            }
        }
    };

    const start = async () => {
        console.log("start");

        await insertCoin({
            enableBots: true,
            botOptions: {
                botClass: MyBot,  // Specifies the bot class to be utilized by the SDK

                // OPTIONAL: You can define custom attributes in the botParams object if you need them during bot initialization.
                // Sample botParams
                botParams: {
                    health: 100
                }
            },
        }, onLaunch);

        onPlayerJoin((state: PlayerState) => {
            playersRef.current = [...playersRef.current, state];
            setPlayers([...playersRef.current]);

            state.onQuit(() => {
                playersRef.current = playersRef.current.filter((p) => p.id !== state.id);
                setPlayers([...playersRef.current]);
            });
        });
    };

    class MyBot extends Bot {
        // Implement your bot logic and methods here

        // Sample Bot Code
        constructor(botParams: Object) {
            super(botParams);
            this.setState("health", 100);
        }
    }

    const assignRoles = (players: PlayerState[]) => {
        if (roles.length > 0) return; // Avoid reassigning roles
        if (players.length > 0) {
            // Choose a seeker through human players
            // @ts-ignore
            const humanPlayers = players.filter((player) => !player.isBot());
            const seekerIndex = Math.floor(Math.random() * humanPlayers.length);
            humanPlayers.forEach((player, index) => {
                player.setState("role", index === seekerIndex ? "seeker" : "hider");
            });
            // Assign hider roles to all the bots 
            // @ts-ignore
            const bots = players.filter((player) => player.isBot());
            bots.forEach((player) => {
                player.setState("role", "hider");
            });
            // Mix the human players and bots
            const mixedPlayers = [...humanPlayers, ...bots];
            // Shuffle the mixed players
            mixedPlayers.sort(() => Math.random() - 0.5);
            // Assign post addresses
            mixedPlayers.forEach((player, index) => {
                player.setState("postAddress", index);
            });

            setRoles(players.map((player) => ({
                id: player.id,
                role: player.getState('role')
            })));
        }
    };

    const createLettersForSeeker = () => {
        players.forEach((player) => {
            if (player.getState('role') === 'seeker' && letters.length < 1) {
                console.log("player", player)
                const newLetterMesh = new Mesh()
                // Create a new Mesh instance
                const newLetter: Letter = {
                    owner: player.id,
                    from: player.id,
                    to: null,
                    msg: "",
                    position: new Vector3(2, 1, 2),
                    uuid: newLetterMesh.uuid
                }
                // Add the new Mesh object directly to the state
                addLetter(newLetter);
            }
        });
    };

    const init = () => {
        console.log("init", status, roles);

        if (isHost() && status === 1 && players.length > 0) {
            console.log("proceed init");
            if (roles.length === 0) {
                assignRoles(players);
            }
            setStatus(2, true);
            createLettersForSeeker();
        }
    };

    useEffect(() => {
        start();
    }, []);

    useEffect(() => {
        if (players.length === 0) return;
        console.log("players", players);
        if (status === 0) {
            setStatus(1, true);
        } else if (status === 1) {
            init();
        } else if (status === 2) {
            if (roles.length) {
                players.forEach((player: PlayerState, i: number) => {
                    roles.forEach((role: any) => {
                        if (player.id === role.id) {
                            player.setState("role", role.role);
                            player.setState("postAddress", i)
                        }
                    });
                });
            }
        }

        if (status === 2 && myPlayer()?.getState("role")) {
            setLoading(false);
        }
    }, [status, players]);

    if (loading) {
        return (
            <Canvas style={{ height: "100vh", position: "fixed", top: "0", left: "0" }} shadows camera={{ position: [0, 7, 12], fov: 50 }}>
                <ambientLight intensity={1} />
                <directionalLight
                    position={[10, 10, 10]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <Loader />
            </Canvas>
        );
    }

    return (
        <>
            {/* <div className="fixed top-0 left-0 bg-slate-800 text-white p-2 z-50">
                <ul>
                    <li>{myPlayer()?.id}</li>
                    <li>Name: {myPlayer()?.getProfile().name}</li>
                    <li>My post address: {myPlayer()?.getState("postAddress")}</li>
                    <li
                        className={`${myPlayer()?.getState("role") === "seeker" ? "text-red-500" : "text-green-500"
                            }`}
                    >
                        Role: {myPlayer()?.getState("role")}
                    </li>
                    {
                        myPlayer().getState("role") === "seeker" ? (
                            <ul>
                                <span>List of post addresses</span>
                                {
                                    players
                                        .filter((player: PlayerState) => player.id !== myPlayer().id)
                                        .map((player: PlayerState) => {
                                            return (
                                                <li key={player.id}>{player.getState("postAddress")}</li>
                                            )
                                        })
                                }
                            </ul>
                        ) : null
                    }
                </ul>
            </div> */}
            <Canvas style={{ height: "100vh", position: "fixed", top: "0", left: "0" }} shadows camera={{ position: [0, 10, 16], fov: 25 }}>
                <Room />
            </Canvas>
        </>
    );
};

export default Game;
