import { useMultiplayerState } from "playroomkit";
import { Mesh } from "three";

export type Letter = {
    owner: string;
    from: string | null;
    to: string | null;
    msg: string | null;
    mesh: Mesh;
}

const useLetters = () => {
    const [letters, setLetters] = useMultiplayerState<Letter[]>('letters', []);

    const addLetter = (letter: Letter) => {
        setLetters([...letters, letter]);
    };

    const updateLetter = (uuid: string, updatedLetter: Letter) => {
        setLetters(letters.map((letter: Letter) =>
            letter.mesh.uuid === uuid
                ? updatedLetter
                : letter
        ));
    };

    return { letters, addLetter, updateLetter };
};

export default useLetters
