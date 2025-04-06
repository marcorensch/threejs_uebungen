import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {glassMaterial, tintedGlassMaterial, frostedGlassMaterial} from './materials.js';
import {Helmet} from './helmet.js';

const logoTexture = './assets/img/logo.png';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias: true});
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);

renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;


renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let lastTime = 0;
const fps = 30; // Maximale FPS
const fpsInterval = 1000 / fps;

const targetVector = new THREE.Vector3(0, 1, 0);


// Load Helmets
// createHelmet(
//     {x: -2, y: 0, z: 0},
//     {x: 0, y: rotationHelper(65), z: 0},
//     new THREE.Color(0x00ff00)
// );
// createHelmet(
//     {x: 0, y: 0, z: 0},
//     {x: 0, y:0, z: rotationHelper(90)}
//     , new THREE.Color(0x0C072D),
//     logoTexture,
//     true
// ).then((helmet) => {
//     scene.add(helmet);
//     const targetNode = helmet.getObjectByName('helmetFootball_helmetShell');
//     createDecals(targetNode);
// });

const helmet = new Helmet(
    logoTexture,
    new THREE.Color(0x0C072D),
    new THREE.Vector3(0, 0, 0)
);
scene.add(await helmet.generate())
console.log(await helmet.generate())

// Kamera-Position
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 90;

camera.lookAt(targetVector.x, targetVector.y, targetVector.z);

// 4. Controls target entsprechend setzen
controls.target.set(targetVector.x, targetVector.y, targetVector.z); // Gleiche Position wie lookAt
controls.update();


// Funktion aufrufen
const pane = createCube(0x131313, 200, 1, 200);
pane.material = tintedGlassMaterial;
pane.receiveShadow = true;
scene.add(pane);

// Beleuchtung
const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
scene.add(ambientLight);

const bottomLight = new THREE.DirectionalLight(0xffffff, 3);
bottomLight.position.set(0, -10, 100);
scene.add(bottomLight);
const bottomLightHelper = new THREE.DirectionalLightHelper(bottomLight, 10);
scene.add(bottomLightHelper);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(-100, 100, 50)
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xB2D0FF, 1);
directionalLight2.position.set(100, 100, 50);
directionalLight2.castShadow = true;
// Optimierung der Schatten-Qualität
directionalLight2.shadow.mapSize.width = 1024;
directionalLight2.shadow.mapSize.height = 1024;
directionalLight2.shadow.camera.near = 1;
directionalLight2.shadow.camera.far = 20;

scene.add(directionalLight2);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight2, 10);
scene.add(directionalLightHelper);


function animate(timestamp) {
    requestAnimationFrame(animate);
    const elapsed = timestamp - lastTime;

    if (elapsed > fpsInterval) {
        lastTime = timestamp - (elapsed % fpsInterval);

        // camera.position.x = Math.sin(Date.now() * 0.0005) * 80;
        // camera.position.z = Math.cos(Date.now() * 0.0005) * 80;
        //
        // camera.lookAt(scene.position);

        controls.update();

        // Hier Ihre Render-Logik
        renderer.render(scene, camera);
    }

}

renderer.setAnimationLoop(animate);



function createCube(color, width = 1, height = 1, depth = 1) {
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color)
    })
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const cube = new THREE.Mesh(geometry, material);
    return cube;
}

function createSphere(color) {
    // Material erstellen
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color)
    });

    // Geometrie und Mesh erstellen
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    return sphere;
}

