import { myPlayer, PlayerState, usePlayersList } from "playroomkit"

const usePlayers = () => {

    const players = usePlayersList()

    const allPlayersExceptMe = players.filter((player: PlayerState) => myPlayer().id !== player.id)
    const seeker = players.find((player: PlayerState) => player.getState("role") === "seeker")


    return { allPlayersExceptMe, players, seeker }
}

export default usePlayers