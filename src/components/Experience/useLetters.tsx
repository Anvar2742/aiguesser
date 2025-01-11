import { myPlayer, useMultiplayerState, usePlayersList } from "playroomkit";
import { useEffect, useState } from "react";
import { Vector3 } from "three";

export type Letter = {
    owner: string;
    from: string | null;
    to: string | null;
    msg: string | null;
    position: Vector3;
    uuid: string;
    isInPostBox: boolean;
}

export type LetterUI = {
    from: string | null;
    to: string | null;
    msg: string | null;
}

const useLetters = () => {
    // Local
    const [isUIUpdate, setIsUIUpdate] = useState(false)
    const [lettersUILocal, setLettersUILocal] = useState<LetterUI[] | null>(null)
    // Multiplayer
    const [letters, setLetters] = useMultiplayerState<Letter[]>('letters', []);
    const [lettersUI, setLettersUI] = useMultiplayerState<LetterUI[] | null>('lettersUI', null);
    const players = usePlayersList()

    const addLetter = (letter: Letter) => {
        setLetters([...letters, letter], true);
    };

    const resetLetters = () => {
        setLetters([], true);
        setLettersUI(null, true);
    };

    const updateLetter = (updatedLetter: Letter, isSending: boolean) => {
        setLetters(letters.map((letter: Letter) =>
            letter.uuid === updatedLetter.uuid
                ? updatedLetter
                : letter
        ), true);
        if (isSending) {
            // console.log(lettersUILocal);

            const newLetterUI: LetterUI = {
                from: updatedLetter.from,
                to: updatedLetter.to,
                msg: updatedLetter.msg
            }
            setLettersUILocal((prev) => prev ? [...prev, newLetterUI] : [newLetterUI])
            setIsUIUpdate(true)
        }
    };

    const sendGptLetter = async (letter: Letter) => {
        // console.log('Sending prompt to GPT:', letter.msg);
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
            // console.log('GPT response:', gptMsg);
            const gptLetter: Letter = {
                owner: to,
                to,
                from: letter.owner,
                uuid: letter.uuid,
                position: letter.position,
                msg: gptMsg,
                isInPostBox: true
            }
            // console.log('GPT letter:', gptLetter);
            updateLetter(gptLetter, true);
        } catch (error) {
            console.error('Error sending prompt to GPT:', error);
        }
    }

    useEffect(() => {
        if (isUIUpdate) {
            setLettersUI([...(lettersUI || []), ...(lettersUILocal || [])], true)
            setIsUIUpdate(false)
            setLettersUILocal(null)
        }
        // console.log(lettersUI);
    }, [lettersUILocal])
    // letters from and to me
    const myLettersUI = lettersUI?.filter((letter: LetterUI) => letter.from === myPlayer().id || letter.to === myPlayer().id)

    return { letters, myLettersUI, lettersUI, addLetter, updateLetter, sendGptLetter, resetLetters };
};

export default useLetters
