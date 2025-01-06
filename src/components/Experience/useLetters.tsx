import { useMultiplayerState } from "playroomkit";

export type Letter = {
    owner: string;
    from: string | null;
    to: string | null;
    msg: string | null;
    uuid: string;
}

const useLetters = () => {
    const [letters, setLetters] = useMultiplayerState<Letter[]>('letters', []);

    const addLetter = (letter: Letter) => {
        setLetters([...letters, letter]);
    };

    const updateLetterOwner = (updatedLetter: Letter) => {
        setLetters(letters.map((letter: Letter) =>
            letter.uuid === updatedLetter.uuid
                ? updatedLetter
                : letter
        ));
    };

    return { letters, addLetter, updateLetterOwner };
};

export default useLetters
