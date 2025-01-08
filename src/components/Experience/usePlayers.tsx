import { myPlayer, PlayerState, usePlayersList } from "playroomkit"

const usePlayers = () => {

    const players = usePlayersList()

    const allPlayersExceptMe = players.filter((player: PlayerState) => myPlayer().id !== player.id)
    const seeker = players.find((player: PlayerState) => player.getState("role") === "seeker")
    const amISeeker = seeker?.id === myPlayer().id


    return { allPlayersExceptMe, players, seeker, amISeeker }
}

export default usePlayers