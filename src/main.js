import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x202020);

const camera=new THREE.PerspectiveCamera(45,window.innerWidth / window.innerHeight,0.1,100);

camera.position.set(0,0.5,0.5);
camera.lookAt(0,0,0);
scene.add(camera);

const renderer=new THREE.WebGLRenderer({
    antialias: true,
    depth: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFShadowMap;

renderer.outputColorSpace=THREE.SRGBColorSpace;

renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;

document.body.appendChild(renderer.domElement);

const canvas=renderer.domElement;
const minRotationY=THREE.MathUtils.degToRad(-60);
const maxRotationY=THREE.MathUtils.degToRad(60);
const minRotationX=THREE.MathUtils.degToRad(-60);
const maxRotationX=THREE.MathUtils.degToRad(45);

const mouseSensitivity=0.002;

let rotationY=camera.rotation.y;
let rotationX=camera.rotation.x;

camera.rotation.order = 'YXZ';

canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
        return;
    }
    if (isInspecting) return;
    if (lastDetectedObject && (lastDetectedObject.name === 'ByR#1' || lastDetectedObject.name === 'Batman638' || lastDetectedObject.name === 'LonelyPlace' || lastDetectedObject.name === 'Nightwing' || lastDetectedObject.name === 'Moneda' || lastDetectedObject.name === 'Sobre')) {
        startInspection(lastDetectedObject);
    }
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        console.log('Mouse bloqueado');
    } else {
        console.log('Mouse desbloqueado');
    }
});

document.addEventListener('keydown', (event) => {

    if (event.key === 'Escape' && isInspecting) {

        stopInspection();

        if (document.pointerLockElement === canvas) {
            document.exitPointerLock();
        }

    }

});

document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement !== canvas) return;
    if (isInspecting) {
        inspectionPivot.rotation.y-=event.movementX*inspectionSensitivity;
        inspectionPivot.rotation.x-=event.movementY*inspectionSensitivity;

        // Limitar la rotación vertical
        inspectionPivot.rotation.x = THREE.MathUtils.clamp(
            inspectionPivot.rotation.x,
            -Math.PI / 2,
            Math.PI / 2
        );

        return;
    }

    // Modo normal: controlar la cámara
    rotationY-=event.movementX*mouseSensitivity;
    rotationX-=event.movementY*mouseSensitivity;

    rotationY=THREE.MathUtils.clamp(
        rotationY,
        minRotationY,
        maxRotationY
    );

    rotationX = THREE.MathUtils.clamp(
        rotationX,
        minRotationX,
        maxRotationX
    );

    camera.rotation.y = rotationY;
    camera.rotation.x = rotationX;
});


const ambientLight = new THREE.AmbientLight(0x8080a0,0.25);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x5C67E0,0.3,20,1.5);
pointLight.position.set(-0.03, 0.8, -0.5);
pointLight.shadow.mapSize.set(1024, 1024);
pointLight.shadow.bias = -0.0001;
pointLight.shadow.normalBias = 0.02;
pointLight.castShadow = true;
scene.add(pointLight);

// Objetos interactivos
const interactiveObjects = [];

const loader = new GLTFLoader();
let model = null;
loader.load(
    './public/models/Escena.glb',
    (gltf) => {
        model = gltf.scene;
        scene.add(model);
        console.log('Escena cargada correctamente');
        const outlineMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.FrontSide,
            toneMapped: false
        });
        model.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
            if (!object.isMesh) return;
            const mats = Array.isArray(object.material)
                ? object.material
                : [object.material];
            if (mats.some((m) => m.name === 'MaterialOutline')) {
                object.material = outlineMat;
            }

        });

        const moneda=model.getObjectByName('Moneda');
        const comic1=model.getObjectByName('Batman638');
        const comic2=model.getObjectByName('ByR#1');
        const comic3=model.getObjectByName('LonelyPlace');
        const comic4=model.getObjectByName('Nightwing');
        const sobre=model.getObjectByName('Sobre');
        const carta=model.getObjectByName('Carta');

        interactiveObjects.push(
            moneda,
            comic1,
            comic2,
            comic3,
            comic4,
            sobre,
            carta
        );

        const validObjects = interactiveObjects.filter(Boolean);
        interactiveObjects.length = 0;
        interactiveObjects.push(...validObjects);

        console.log('Sobre:', sobre);
        console.log('Carta:', carta);
        console.log('Moneda:', moneda);
        console.log('comic1:', comic1);
        console.log('comic2:', comic2);
        console.log('comic3:', comic3);
        console.log('comic4:', comic4);

    },

    (progress) => {
        if (progress.total > 0) {
            const percentage = (progress.loaded / progress.total) * 100;
            console.log(`Cargando: ${percentage.toFixed(2)}%`);
        }
    },
    (error) => {
        console.error('Error al cargar el modelo:', error);
    }
);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );
});


const raycaster = new THREE.Raycaster();
const centerScreen = new THREE.Vector2(0, 0);
let lastDetectedObject = null;

const objectInfo = {
    'ByR#1': {
        title: 'Batman y Robin: Batman Reborn',
        description: 'Tras los eventos donde Bruce Wayne es dado por muerto, Dick Grayson asume el manto de Batman para evitar que la ciudad caiga en el caos, y recluta a Damian Wayne para que sea su nuevo Robin.'
    },
    'Batman638':{
        title: 'Batman: Under the Red Hood',
        description: 'Un nuevo y despiadado vigilante apodado Red Hood irrumpe en Gotham limpiando las calles a su manera: matando a los criminales que Batman se niega a ejecutar. La tensión explota cuando se descubre que detrás de la máscara roja se esconde Jason Todd, el segundo Robin, quien supuestamente había muerto a manos del Joker años atrás y ha regresado buscando venganza y respuestas sobre por qué Batman no lo vengó.'
    },
    'LonelyPlace':{
        title: 'Batman: A Lonely Place of Dying',
        description: 'Batman está cayendo en un espiral de autodestrucción y violencia implacable tras la tragedia de Jason Todd. Un joven Tim, usando su intelecto deductivo, descubre la identidad de Batman y se da cuenta de que "Batman necesita un Robin" para no perder su humanidad, por lo que emprende una misión personal para salvar a Bruce de sí mismo y ganarse el puesto.'
    },
    'Nightwing':{
        title: 'Nightwing: Year One',
        description: 'Tras años de ser el compañero de Batman bajo la identidad de Robin, Dick Grayson cumple la mayoría de edad y su relación con Bruce se vuelve insostenible debido al control y la oscuridad de este último. Dick decide abandonar Gotham y forjar su propio camino como Nightwing, enfrentando nuevos desafíos y descubriendo su verdadera identidad como héroe independiente.'
    },
    'Moneda':{
        title: 'Moneda de plata',
        description: 'Cara o cruz, tu decides...'
    },
    'Sobre':{
        title: 'Sobre misterioso',
        description: '¿Que será...?'
    }
};



// =====================================
// SISTEMA DE INSPECCIÓN
// =====================================
let isInspecting = false;
// Grupo que contendrá el objeto inspeccionado
const inspectionPivot = new THREE.Group();
camera.add(inspectionPivot);
// Distancia del objeto respecto a la cámara
const inspectionDistance = 2;
// Sensibilidad de rotación
const inspectionSensitivity = 0.005;
// Elementos HTML
const inspectionUI = document.getElementById('inspection-ui');
const inspectionTitle = document.getElementById('inspection-title');
const inspectionDescription = document.getElementById('inspection-description');

function startInspection(object) {
    if (!object) return;

    console.log('Inspeccionando:', object.name, object.type);

    // Clonar el objeto y todos sus hijos
    const inspectionObject = object.clone(true);

    // Preparar todas las mallas del objeto
    inspectionObject.traverse(child => {
        if (!child.isMesh) return;

        // Clonar geometría y materiales para no modificar el original
        child.geometry = child.geometry.clone();

        if (Array.isArray(child.material)) {
            child.material = child.material.map(material => material.clone());
        } else {
            child.material = child.material.clone();
        }

        child.frustumCulled = false;
        child.renderOrder = 9999;

        const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

        materials.forEach(material => {
            material.side = THREE.DoubleSide;
            material.depthTest = false;
            material.depthWrite = false;
            material.toneMapped = false;
        });
    });

    // Reiniciar transformaciones del objeto principal
    inspectionObject.position.set(0, 0, 0);
    inspectionObject.rotation.set(0, 0, 0);
    inspectionObject.scale.set(1, 1, 1);

    // Calcular los límites de todas las mallas
    inspectionObject.updateMatrixWorld(true);

    const boundingBox = new THREE.Box3().setFromObject(inspectionObject);

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    boundingBox.getCenter(center);
    boundingBox.getSize(size);

    // Centrar el objeto
    inspectionObject.position.sub(center);

    // Calcular escala
    const maxDimension = Math.max(size.x, size.y, size.z);

    if (maxDimension === 0) {
        console.error('El objeto no tiene dimensiones válidas:', object.name);
        return;
    }

    const desiredSize = 1.2;
    const scaleFactor = desiredSize / maxDimension;

    inspectionObject.scale.setScalar(scaleFactor);

    // Limpiar el pivote
    while (inspectionPivot.children.length > 0) {
        inspectionPivot.remove(inspectionPivot.children[0]);
    }

    // Posición y orientación de inspección
    inspectionPivot.position.set(0, 0, -1.5);

    inspectionPivot.rotation.set(
        THREE.MathUtils.degToRad(90),
        THREE.MathUtils.degToRad(90),
        0
    );

    inspectionPivot.scale.set(1, 1, 1);

    // Añadir el objeto
    inspectionPivot.add(inspectionObject);

    // Mostrar información
    const info = objectInfo[object.name];

    if (info) {
        inspectionTitle.textContent = info.title;
        inspectionDescription.textContent = info.description;
    }

    inspectionUI.classList.add('active');
    interactionIndicator.classList.remove('active');

    isInspecting = true;

    console.log('Centro geométrico:', center);
    console.log('Dimensiones:', size);
    console.log('Escala:', scaleFactor);
    console.log('Jerarquía:', inspectionPivot);
}

function stopInspection() {
    if (!isInspecting) return;

    isInspecting = false;

    while (inspectionPivot.children.length > 0) {
        const object = inspectionPivot.children[0];

        inspectionPivot.remove(object);

        object.traverse(child => {
            if (!child.isMesh) return;

            child.geometry.dispose();

            if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
            } else {
                child.material.dispose();
            }
        });
    }

    inspectionUI.classList.remove('active');
    interactionIndicator.style.opacity = '1';

    console.log('Inspección finalizada');
}


// Elementos del indicador
const interactionIndicator = document.getElementById('interaction-indicator');
const objectNameLabel = document.getElementById('object-name');
function detectObject() {
    if (isInspecting) 
        return;

    raycaster.setFromCamera(centerScreen, camera);
    const intersects = raycaster.intersectObjects(
        interactiveObjects,
        true
    );
    let detectedObject = null;
    if (intersects.length > 0) {
        let object = intersects[0].object;
        while (
            object &&
            !interactiveObjects.includes(object)
        ) {
            object = object.parent;
        }
        detectedObject = object;
    }
    if (detectedObject !== lastDetectedObject) {
        lastDetectedObject = detectedObject;
        if (detectedObject) {
            console.log('Objeto detectado:', detectedObject.name);
            interactionIndicator.classList.add('active');
            objectNameLabel.textContent = detectedObject.name;
        } else {
            interactionIndicator.classList.remove('active');
            objectNameLabel.textContent = '';
        }

    }

}

function animate() {
    requestAnimationFrame(animate);
    detectObject();
    
    renderer.render(scene, camera);
}
animate();