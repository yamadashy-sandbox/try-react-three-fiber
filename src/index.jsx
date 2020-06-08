import ReactDOM from 'react-dom'
import * as THREE from 'three';
import React, { Suspense, useRef, useState } from 'react'
import { unstable_createResource as createResource } from './react-cache/index'
import { Canvas, extend, useThree, useRender } from 'react-three-fiber'
import { MTLLoader, OBJLoader } from 'three-obj-mtl-loader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import './styles.css'


extend({ OrbitControls })

const objMtlResource = createResource(filePath => {
  const mtlLoader = new MTLLoader();
  const objLoader = new OBJLoader();

  return new Promise(async (resolve, reject) => {
    mtlLoader.load(filePath + '.mtl', (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load(filePath + '.obj', (object) => {
        object.scale.set(0.1, 0.1, 0.1);
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        resolve({
          scene: object,
        })
      });
    });
  });
});

function ObjMtlModel({ filePath }) {
  const { scene } = objMtlResource.read(filePath)
  return <primitive object={scene} />
}

function Box() {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" transparent opacity={0.5} />
    </mesh>
  )
}

function Controls(props) {
  const { camera } = useThree()
  const controls = useRef()
  useRender(() => controls.current && controls.current.update())
  return <orbitControls ref={controls} args={[camera]} {...props} />
}

function App() {
  const [clicked, set] = useState(true)
  return (
    <>
      <Canvas camera={{ position: [5, 3, 6] }}>
        <Controls enableDamping enablePan={false} dampingFactor={0.1} rotateSpeed={0.1} maxPolarAngle={Math.PI / 2} />
        <ambientLight intensity={0.5} />
        <spotLight intensity={0.8} position={[300, 300, 400]} />
        <Suspense fallback={<Box />}>{clicked && <ObjMtlModel filePath='./assets/mushi' />}</Suspense>
      </Canvas>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
