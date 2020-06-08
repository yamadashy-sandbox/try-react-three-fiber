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

function ObjMtlModel({ filePath, scale, position }) {
  const { scene } = objMtlResource.read(filePath)
  scene.scale.set(scale[0], scale[1], scale[2]);
  scene.position.set(position.x, position.y, position.z);
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
  return (
    <>
      <Canvas camera={{ position: [15, 9, 18] }} colorManagement style={{ background: '#a3cfff' }} shadowMap={{ enabled: true, type: THREE.PCFShadowMap }}>
        <Controls enableDamping enablePan={false} dampingFactor={0.1} rotateSpeed={0.1} maxPolarAngle={Math.PI / 2} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, -10]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.01}
          shadow-camera-far={500}
          castShadow
        />
        <Suspense fallback={<Box />}>
          <ObjMtlModel filePath='./assets/mushi' scale={[0.3, 0.3, 0.3]} position={{x: 0, y: 0, z: 0}} />
          <ObjMtlModel filePath='./assets/field-flat' scale={[1, 1, 1]} position={{x: 0, y: -1, z: 0}} />
        </Suspense>
      </Canvas>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
