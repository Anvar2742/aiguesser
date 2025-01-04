import { useMultiplayerState } from "playroomkit";


const useLetters = () => {
    const [letters, setLetters] = useMultiplayerState<any>('letters', []);

    const addLetter = (letter: any) => {
        console.log(letter);
        
        setLetters([...letters, letter]);
    };

    const updateLetter = (id: any, updatedData: any) => {
        setLetters([letters.map((letter: any) =>
            letter.id === id ? { ...letter, ...updatedData } : letter
        )]);
    };

    return { letters, addLetter, updateLetter };
};

export default useLetters
