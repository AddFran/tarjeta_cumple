import * as THREE from 'three';

// 1. Escena
const scene=new THREE.Scene();
scene.background=new THREE.Color('#070707');

// 2. Cámara
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth/window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 0, 4);

// 3. Renderizador
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

// 4. Iluminación
const ambientLight=new THREE.AmbientLight(
  0xffffff,
  1
);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(
  0xffffff,
  3
);
keyLight.position.set(3,4,5);
scene.add(keyLight);

const fillLight = new THREE.PointLight(
  0x536dfe,
  25
);
fillLight.position.set(-3, 0, 3);
scene.add(fillLight);

// 5. Tarjeta
const geometry = new THREE.BoxGeometry(
  3.2, 2, 0.01
);

const material = new THREE.MeshStandardMaterial({
  color: '#303c65',
  metalness: 0.5,
  roughness: 0.3
});

const card = new THREE.Mesh(geometry, material);
scene.add(card);

// 6. Texto frontal mediante HTML
// En este primer ejemplo, el texto se dibuja
// como una capa HTML encima del canvas.

const label = document.createElement('div');

label.textContent = 'TU NOMBRE';
Object.assign(label.style, {
  position: 'fixed',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  font: '600 18px sans-serif',
  letterSpacing: '3px',
  pointerEvents: 'none'
});

document.body.appendChild(label);

// 7. Bucle de animación
const clock = new THREE.Clock();

const targetRotation = { x: 0, y: 0 };

window.addEventListener('pointermove', (event) => {
  targetRotation.y =
    ((event.clientX / window.innerWidth) - 0.5) * 0.5;

  targetRotation.x =
    ((event.clientY / window.innerHeight) - 0.5) * -0.25;
});

function animate() {
  card.rotation.x +=
    (targetRotation.x - card.rotation.x) * 0.1;

  card.rotation.y +=
    (targetRotation.y - card.rotation.y) * 0.1;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// 8. Adaptación al tamaño de la ventana
window.addEventListener('resize', () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
});
