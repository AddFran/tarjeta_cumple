import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x202020);

const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,100);
camera.position.set(0,0.5,0.5);
camera.lookAt(0,0,0);

const renderer=new THREE.WebGLRenderer({antialias: true,depth: true});

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFShadowMap;

renderer.outputColorSpace=THREE.SRGBColorSpace;

renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;

const controls=new PointerLockControls(camera,renderer.domElement);
document.addEventListener('click',() => {
    controls.lock();
});
controls.addEventListener('unlock',() => {
    console.log("Mouse desbloqueado");
});
document.body.appendChild(renderer.domElement);



// ILUMINACIÓN AMBIENTAL
const ambientLight = new THREE.AmbientLight(0x8080a0, 0.2);
scene.add(ambientLight);


// ILUMINACIÓN DIRECCIONAL
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0,0.8,-0.1);

directionalLight.castShadow = true;

directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;

//scene.add(directionalLight);


// ILUMINACIÓN LOCAL
const pointLight = new THREE.PointLight(0x5C67E0, 0.3, 20, 1.5);
pointLight.position.set(-0.03,0.8,-0.5);

pointLight.shadow.mapSize.set(2048, 2048);
pointLight.shadow.bias = -0.0001;
pointLight.shadow.normalBias = 0.02;

pointLight.castShadow = true;
pointLight.shadow.mapSize.set(1024, 1024);
scene.add(pointLight);

// Referencia visual
const lightHelper = new THREE.PointLightHelper(pointLight, 0.1);
scene.add(lightHelper);



const loader=new GLTFLoader();
let model=null;

loader.load(
    './public/models/Escena.glb',
    
    (gltf) => {
        model=gltf.scene;
        scene.add(model);


        console.log('Escena cargada correctamente');
        const outlineMat=new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.FrontSide,
            toneMapped: false
        });

        model.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
            if(!object.isMesh) 
                return;
            const mats=Array.isArray(object.material) ? object.material : [object.material];
            if(mats.some((m) => m.name === 'MaterialOutline')){
                object.material=outlineMat;
            }
        });

        const envelope=model.getObjectByName('Envelope');
        const paper=model.getObjectByName('Paper');
        const magazine=model.getObjectByName('Magazine');
        console.log('Sobre:', envelope);
        console.log('Carta:', paper);
        console.log('Revista:', magazine);
    },

    (progress)=>{
        if(progress.total>0){
            const percentage=(progress.loaded/progress.total)*100;
            console.log(`Cargando: ${percentage.toFixed(2)}%`);
        }
    },
    (error)=>{
        console.error('Error al cargar el modelo:',error);

    }
);

window.addEventListener('resize',() => {
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const maxMirarIzquierda = THREE.MathUtils.degToRad(45);
const maxMirarDerecha = THREE.MathUtils.degToRad(-45);

function animate(){
    requestAnimationFrame(animate);
    
    renderer.render(scene,camera);
}
animate();