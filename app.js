console.log("its running");

let video = document.getElementById('video');
let scene, camera, renderer, glasses, controls;
let isTryOnMode = false , cameraOn=false;

var HEIGHT = $("#content").height();
var WIDTH = $("#content").width();


document.getElementById('tryOnButton').addEventListener('click', switchMode);
window.onload = initPlainSurface;

function switchMode(){
    isTryOnMode=!isTryOnMode;
    
    if(isTryOnMode){

        startVirtualTryOn();
    }
    else{
        if(cameraOn){
            stopCamera();

        }
        initPlainSurface();
    }
}
function initPlainSurface() {
    initThreeJS();
    animate();
    console.log("glasses rendered");
}
function stopCamera() {
    let stream = video.srcObject;
    if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); 
        video.srcObject = null; 
    }
    cameraOn=false;
}

function startVirtualTryOn() {
    
    initThreeJS();
    isTryOnMode = true;
    if (controls) {
        controls.dispose(); 
        controls = null;
    }
    setupCamera().then(video => {
        cameraOn=true;
        video.play();
        console.log("Video playing");
        loadFacemeshModel().then(model => {
            console.log("Facemesh model loaded, starting detection");
            detectFace(model);
        }).catch(err => {
            console.error("Error loading facemesh model: ", err);
        });
    }).catch(err => {
        console.error("Error setting up camera: ", err);
    });
}

async function setupCamera() {
    video.width = WIDTH;
    video.height = HEIGHT;

    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(stream => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                resolve(video);
            };
        }).catch(err => reject(err));
    });
}

async function loadFacemeshModel() {
    console.log("Loading facemesh model");
    const model = await facemesh.load();
    console.log("Facemesh model loaded");
    return model;
}

async function detectFace(model) {
    const canvas = document.getElementById('canvas');
    canvas.width =WIDTH;
    canvas.height = HEIGHT;

    async function frame() {
        const predictions = await model.estimateFaces(video);
        if (predictions.length > 0) {
            predictions.forEach(prediction => {
                if (prediction && prediction.scaledMesh) {
                    positionGlasses(prediction.scaledMesh);
                }
            });
        }
        requestAnimationFrame(frame);
    }
    frame();
}

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    
    const amlight = new THREE.AmbientLight(0x404040, 10);
    scene.add(amlight);

    const dilight = new THREE.DirectionalLight(0xffffff, 20);
    dilight.position.set(0, 1, 0);
    dilight.castShadow = false;
    scene.add(dilight);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), alpha: true, antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    camera.position.z = 10;

    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('public/specs/scene.gltf', (gltf) => {
        glasses = gltf.scene;
        glasses.scale.set(1, 1, 1);
        scene.add(glasses);
        rotateObject(glasses, 0, -90, 0);

        if (!isTryOnMode) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.maxPolarAngle = Math.PI / 2;
            camera.position.z = 4;
            renderer.render(scene, camera);
        }
    }, undefined, (error) => {
        console.error('An error happened', error);
    });

    if (isTryOnMode) {
        animate();
    }
    console.log("in three ");
}

function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
    object.rotateX(THREE.Math.degToRad(degreeX));
    object.rotateY(THREE.Math.degToRad(degreeY));
    object.rotateZ(THREE.Math.degToRad(degreeZ));
}

function positionGlasses(landmarks) {
    if (!glasses || !isTryOnMode) return;

    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    const centerX = (leftEye[0] + rightEye[0]) / 2;
    const centerY = (leftEye[1] + rightEye[1]) / 2;

    const normalizedX = (centerX / video.videoWidth) * 2 - 1;
    const normalizedY = -(centerY / video.videoHeight) * 2 + 1;

    const faceWidth = rightEye[0] - leftEye[0];
    const scaleFactor = faceWidth / 45;

    glasses.position.set(
        normalizedX * 20,
        normalizedY * 20,
        -10
    );

    glasses.scale.set(scaleFactor, scaleFactor, scaleFactor);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


