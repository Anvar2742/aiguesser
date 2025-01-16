import { PlayerState } from 'playroomkit';
import { Container, FontFamilyProvider, Text } from '@react-three/uikit';
import useLetters, { LetterUI } from '../helpers/useLetters';
import usePlayers from '../helpers/usePlayers';


type ChatProps = {
    player: PlayerState;
}

const Chat: React.FC<ChatProps> = ({ player }) => {
    const playerRole = player.getState("role");
    const { lettersUI } = useLetters();
    const { seeker, amISeeker } = usePlayers();

    // Skip invalid combinations
    if ((!amISeeker && playerRole === "seeker") || (amISeeker && playerRole === "seeker")) {
        return null;
    }

    return (
        <Container flexDirection={"column"} justifyContent={"center"} width={"100%"} padding={10}>
            <FontFamilyProvider roboto={{
                medium: "fixed-roboto-condensed-msdf.json",
            }}>
                <Text
                    fontSize={10}
                    color="#f5f5f5"
                    fontWeight={700}
                    backgroundColor={"blue"}
                    paddingY={4}
                    paddingX={8}
                    borderRadius={5}
                    textAlign={"center"}
                    alignSelf="center"
                    maxHeight={20}
                    marginBottom={15}
                >
                    Игрок #{player.getState("postAddress")}
                </Text>
                <Container flexDirection="column" key={player.id} width="100%" borderColor={"gray"} borderWidth={2} padding={15} overflow={"scroll"} gap={10} height={"100%"}>
                    {
                        lettersUI
                            ?.filter((letter: LetterUI) => {
                                const isBetweenSeekerAndPlayer = (letter.from === seeker?.id && letter.to === player?.id) || (letter.from === player?.id && letter.to === seeker?.id);
                                return isBetweenSeekerAndPlayer;
                            })
                            ?.map((letter: LetterUI, index: number) => {
                                return (
                                    <Text
                                        key={index}
                                        fontSize={7}
                                        color="#f5f5f5"
                                        alignSelf={letter.from === seeker?.id ? "flex-start" : "flex-end"}
                                        maxWidth={150}
                                        backgroundColor={"#444"}
                                        borderRadius={10}
                                        paddingY={4}
                                        paddingX={8}
                                        maxHeight={20}
                                    >
                                        {letter.msg ?? ''}
                                    </Text>
                                );
                            })
                    }
                </Container>
            </FontFamilyProvider>
        </Container>
    );
};


export default Chat