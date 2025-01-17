import { OrbitControls } from '@react-three/drei'
import Game from './components/Experience/Game/Game'
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';
import { useRef } from 'react';

function App() {

  return (
    <>
      <Game />
    </>
  )
}

export default App
