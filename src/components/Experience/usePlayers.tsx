import { myPlayer, PlayerState, usePlayersList } from "playroomkit"

const usePlayers = () => {

    const players = usePlayersList()

    // Sort players by their post address
    const playersForGame = players.sort((a: PlayerState, b: PlayerState) => {
        return a.getState("postAddress") - b.getState("postAddress")
    })
    const allPlayersExceptMe = playersForGame.filter((player: PlayerState) => myPlayer().id !== player.id)
    const seeker = players.find((player: PlayerState) => player.getState("role") === "seeker")
    const amISeeker = seeker?.id === myPlayer().id


    return { allPlayersExceptMe, players, seeker, amISeeker, playersForGame }
}

export default usePlayers