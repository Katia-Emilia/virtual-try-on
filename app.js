console.log("its running");

// Get the video element from the DOM
let video = document.getElementById('video');
let scene, camera, renderer, glasses, controls;
let isTryOnMode = false , cameraOn=false;

// Get the dimensions for the content area
var HEIGHT = $("#content").height();
var WIDTH = $("#content").width();

// Event listener for the Try On button
document.getElementById('tryOnButton').addEventListener('click', switchMode);
// Initialize the plain surface when the page loads
window.onload = initPlainSurface;


// Switch between plain surface mode and virtual try-on mode
function switchMode(){
    isTryOnMode=!isTryOnMode;
    
    if(isTryOnMode){

        startVirtualTryOn();  // Start the virtual try-on mode
    }
    else{
        if(cameraOn){
            stopCamera(); // Stop the camera if it's on

        }
        initPlainSurface(); // Initialize the plain surface
    }
}

// Initialize the plain surface with Three.js scene
function initPlainSurface() {
    initThreeJS(); // Set up the Three.js scene
    animate(); // Start the rendering loop
    console.log("glasses rendered");
}

// Stop the camera by stopping all video tracks
function stopCamera() {
    let stream = video.srcObject;
    if (stream) {
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop each track
        video.srcObject = null; // Clear the video source
    }
    cameraOn=false;
}

// Start the virtual try-on mode, including setting up the camera and loading the FaceMesh model
function startVirtualTryOn() {
    initThreeJS(); // Set up the Three.js scene for try-on mode
    isTryOnMode = true;
    if (controls) {
        controls.dispose(); // Dispose of controls if they exist 
        controls = null;
    }

    // Set up the camera and start the video stream
    setupCamera().then(video => {
        cameraOn=true;
        video.play();
        console.log("Video playing");
         // Load the FaceMesh model for face detection
        loadFacemeshModel().then(model => {
            console.log("Facemesh model loaded, starting detection");
            detectFace(model); // Start detecting the face
        }).catch(err => {
            console.error("Error loading facemesh model: ", err);
        });
    }).catch(err => {
        console.error("Error setting up camera: ", err);
    });
}


// Set up the camera for capturing the video feed
async function setupCamera() {
    video.width = WIDTH;
    video.height = HEIGHT;

    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(stream => {
            video.srcObject = stream; // Set the video source to the camera stream
            video.onloadedmetadata = () => {
                resolve(video); // Resolve the promise when metadata is loaded
            };
        }).catch(err => reject(err));  // Reject the promise if an error occurs
    });
}

// Load the FaceMesh model for detecting facial landmarks
async function loadFacemeshModel() {
    console.log("Loading facemesh model");
    const model = await facemesh.load();// Load the model
    console.log("Facemesh model loaded");
    return model;
}

// Detect the face and position the glasses based on facial landmarks
async function detectFace(model) {
    const canvas = document.getElementById('canvas');
    canvas.width =WIDTH;
    canvas.height = HEIGHT;
    
    // Recursive function to estimate faces and update glasses position
    async function frame() {
        const predictions = await model.estimateFaces(video);// Get face predictions
        if (predictions.length > 0) {
            predictions.forEach(prediction => {
                if (prediction && prediction.scaledMesh) {
                    positionGlasses(prediction.scaledMesh);// Position glasses based on landmarks
                
                }
            });
        }
        requestAnimationFrame(frame); // Continue the loop
    }
    frame();// Start the detection loop
}

// Initialize the Three.js scene, camera, and renderer
function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

    // Add ambient light to the scene
    const amlight = new THREE.AmbientLight(0x404040, 10);
    scene.add(amlight);

    // Add directional light to the scene
    const dilight = new THREE.DirectionalLight(0xffffff, 20);
    dilight.position.set(0, 1, 0);
    dilight.castShadow = false;
    scene.add(dilight);

    // Create a WebGL renderer and attach it to the canvas
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), alpha: true, antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    camera.position.z = 10;
    
    // Load the glasses model using GLTFLoader
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('public/specs/scene.gltf', (gltf) => {
        glasses = gltf.scene;
        glasses.scale.set(1, 1, 1); // Scale the glasses model
        scene.add(glasses);
        rotateObject(glasses, 0, -90, 0); // Rotate the glasses model so glasses

        // If not in try-on mode, enable OrbitControls for interaction
        if (!isTryOnMode) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.maxPolarAngle = Math.PI / 2;
            camera.position.z = 4;
            renderer.render(scene, camera);// Render the scene
        }
    }, undefined, (error) => {
        console.error('An error happened', error); // Log any errors during loading
    });

    if (isTryOnMode) {
        animate();  // Start the animation loop if in try-on mode
    }
    console.log("in three ");
}


// Rotate the object in 3D space
function rotateObject(object, degreeX = 0, degreeY = 0, degreeZ = 0) {
    object.rotateX(THREE.Math.degToRad(degreeX));
    object.rotateY(THREE.Math.degToRad(degreeY));
    object.rotateZ(THREE.Math.degToRad(degreeZ));
}

// Position the glasses model based on facial landmarks
function positionGlasses(landmarks) {
    if (!glasses || !isTryOnMode) return;

    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    const centerX = (leftEye[0] + rightEye[0]) / 2;
    const centerY = (leftEye[1] + rightEye[1]) / 2;

    // Normalize the coordinates to the range [-1, 1]
    const normalizedX = (centerX / video.videoWidth) * 2 - 1;
    const normalizedY = -(centerY / video.videoHeight) * 2 + 1;

    // Calculate the face width and scale the glasses accordingly
    const faceWidth = rightEye[0] - leftEye[0];
    const scaleFactor = faceWidth / 45;

    // Position and scale the glasses
    glasses.position.set(
        normalizedX * 20,
        normalizedY * 20,
        -10
    );

    glasses.scale.set(scaleFactor, scaleFactor, scaleFactor);
}

// Animate the Three.js scene
function animate() {
    requestAnimationFrame(animate); // Request the next frame
    renderer.render(scene, camera); // Render the scene
}


