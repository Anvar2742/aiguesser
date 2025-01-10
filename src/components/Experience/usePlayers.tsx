import { myPlayer, PlayerState, usePlayersList } from "playroomkit"

const usePlayers = () => {

    const players = usePlayersList()

    const allPlayersExceptMe = players.filter((player: PlayerState) => myPlayer().id !== player.id)
    // Sort players by their post address
    const playersForGame = players.sort((a: PlayerState, b: PlayerState) => {
        return a.getState("postAddress") - b.getState("postAddress")
    })
    console.log(playersForGame)
    const seeker = players.find((player: PlayerState) => player.getState("role") === "seeker")
    const amISeeker = seeker?.id === myPlayer().id


    return { allPlayersExceptMe, players, seeker, amISeeker, playersForGame }
}

export default usePlayers