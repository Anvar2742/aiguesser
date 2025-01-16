import { useState } from 'react';
import { Text } from '@react-three/drei';

const Chat = () => {
    const [messages, setMessages] = useState([
        "Hello! Welcome to the chat.",
        "How can I help you?",
        "How can I help you?",
    ]);

    // Function to add a new message
    const addMessage = (newMessage: string) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    return (
        <group position={[0, 3, 1]}>
            {/* Chat Window Plane */}
            <mesh>
                <planeGeometry args={[5, 3]} />
                <meshStandardMaterial color="#000" opacity={.9} transparent />
            </mesh>

            {/* Chat Messages */}
            <group position={[-1.4, 0.8, 0.01]}>
                {messages.map((msg, index) => (
                    <Text
                        key={index}
                        position={[0, -index * 0.5, 0]} // Adjust position for each message
                        fontSize={0.25}
                        color="#fff"
                        maxWidth={4}
                        lineHeight={1.2}
                        anchorX="left"
                        anchorY="top"
                    >
                        {msg}
                    </Text>
                ))}
            </group>

            {/* Example: Add new message on click */}
            <mesh
                position={[0, -1.2, 0.01]}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent click-through
                    addMessage("New message added!");
                }}
            >
                <boxGeometry args={[0.9, 0.3, 0.1]} />
                <meshStandardMaterial color="blue" />
                <Text fontSize={0.15} color="white" position={[0, 0, 0.06]}>
                    Add Msg
                </Text>
            </mesh>
        </group>
    );
};


export default Chat