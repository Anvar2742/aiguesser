import { useState, useEffect } from 'react';
import { Mesh, Group, Vector3 } from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { myPlayer } from 'playroomkit';
import useLetters, { Letter } from '../helpers/useLetters';
import usePlayers from '../helpers/usePlayers';

const useLetterInteractions = (playerRef: React.RefObject<any>, postBoxRef: React.RefObject<Group>) => {
    const [heldObject, setHeldObject] = useState<Mesh | null>(null);
    const [postedObject, setPostedObject] = useState<Mesh | null>(null);

    const { letters, updateLetter, sendGptLetter } = useLetters();
    const { playersForGame, allPlayersExceptMe, amISeeker } = usePlayers();
    const { scene } = useThree()

    useEffect(() => {
        console.log(postedObject);
        
    }, [postedObject])

    // Pick up a letter
    const handlePickUp = (item: Mesh | null) => {
        if (!item) return;
        item.position.set(0, 0, 0);

        const handBone = playerRef.current?.characterScene.getObjectByName("Cube016");
        if (handBone) {
            handBone.attach(item);
        }

        setHeldObject(item);
        const existingLetter = letters.find((letter: Letter) => letter.uuid === item.uuid);
        if (!existingLetter) return;
        const updatedLetter: Letter = { ...existingLetter, isInPostBox: false };
        updateLetter(updatedLetter, false);
    };

    // Drop the letter
    const dropObject = (e: ThreeEvent<MouseEvent>) => {
        if (heldObject) {
            scene.attach(heldObject);
            heldObject.position.copy(e.point.add(new Vector3(0, 1, 0))); // Drop above the clicked position
            heldObject.updateMatrixWorld();
            setHeldObject(null);
        }
    };

    // Put the letter in the post box
    const putObjectInPost = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (!myPlayer().getState("isAlive")) {
            alert("You are dead. You can't send letters.");
            return;
        }

        if (heldObject && postBoxRef.current) {
            postBoxRef.current.attach(heldObject);
            heldObject.position.copy(new Vector3(0, 1, 0));
            heldObject.updateMatrixWorld();

            const existingLetter = letters.find((letter: Letter) => letter.uuid === heldObject.uuid);
            if (!existingLetter) return;
            const updatedLetter: Letter = { ...existingLetter, isInPostBox: true };
            updateLetter(updatedLetter, false);
            setHeldObject(null);
        }
    };

    // Send a letter
    const sendLetter = (e: ThreeEvent<MouseEvent>, to: string | null) => {
        e.stopPropagation();
        if (!myPlayer()?.getState("isAlive")) {
            alert("You are dead. You can't send letters.");
            return;
        }
        if (postedObject?.userData.msg.length === 0) {
            alert("Letter empty.");
            return;
        }
        if (!to) {
            alert("No recipient selected.");
            return;
        }

        if (amISeeker) {
            const recipientPlayer = allPlayersExceptMe.find(player => player.id === to);
            if (!recipientPlayer?.getState("isAlive")) {
                alert("You killed this recipient.");
                return;
            }
        }

        if (postedObject) {
            const updatedLetter: Letter = {
                owner: to,
                to,
                from: myPlayer()?.id,
                uuid: postedObject.uuid,
                position: postedObject.getWorldPosition(new Vector3()),
                msg: postedObject.userData.msg,
                isInPostBox: true,
            };
            updateLetter(updatedLetter, true);

            const toPlayer = playersForGame.find(player => player.id === to);
            // @ts-ignore
            if (toPlayer?.isBot()) {
                sendGptLetter(updatedLetter);
            }

            setPostedObject(null);
        } else {
            alert("Put a letter in the box.");
        }
    };

    // Update the letter's message
    const updateLetterMessage = (msg: string) => {
        if (heldObject) {
            const existingLetter = letters.find((letter: Letter) => letter.uuid === heldObject.uuid);
            if (!existingLetter) return;
            const updatedLetter: Letter = { ...existingLetter, msg };
            updateLetter(updatedLetter, false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                e.preventDefault();
                if (heldObject) {
                    const msg = prompt("Enter the message", heldObject.userData.msg);
                    if (msg) {
                        updateLetterMessage(msg);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [heldObject]);

    return {
        handlePickUp,
        dropObject,
        putObjectInPost,
        sendLetter,
        heldObject,
        postedObject,
        setPostedObject
    };
};

export default useLetterInteractions;
