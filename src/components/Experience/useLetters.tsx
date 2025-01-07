import { useMultiplayerState, usePlayersList } from "playroomkit";
import { Vector3 } from "three";

export type Letter = {
    owner: string;
    from: string | null;
    to: string | null;
    msg: string | null;
    position: Vector3;
    uuid: string;
}

const useLetters = () => {
    const [letters, setLetters] = useMultiplayerState<Letter[]>('letters', []);
    const players = usePlayersList()

    const addLetter = (letter: Letter) => {
        setLetters([...letters, letter]);
    };

    const updateLetter = (updatedLetter: Letter) => {
        setLetters(letters.map((letter: Letter) =>
            letter.uuid === updatedLetter.uuid
                ? updatedLetter
                : letter
        ));
    };

    const sendGptLetter = async (letter: Letter) => {
        console.log('Sending prompt to GPT:', letter.msg);
        const to: string | undefined = players.find(player => player.getState("role") === "seeker")?.id
        if (!to) return
        try {
            const response = await fetch("http://127.0.0.1:5001/aiguessr-vf/europe-west1/gptLetter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    message: letter.msg
                }),
            });

            const data = await response.json();

            const gptMsg = data.reply;

            // const gptMsg = completion.
            console.log('GPT response:', gptMsg);
            const gptLetter: Letter = {
                owner: to,
                to,
                from: letter.owner,
                uuid: letter.uuid,
                position: letter.position,
                msg: gptMsg,
            }
            console.log('GPT letter:', gptLetter);
            updateLetter(gptLetter);
        } catch (error) {
            console.error('Error sending prompt to GPT:', error);
        }
    }

    return { letters, addLetter, updateLetter, sendGptLetter };
};

export default useLetters
