import { useMultiplayerState } from "playroomkit";
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

    return { letters, addLetter, updateLetter };
};

export default useLetters
