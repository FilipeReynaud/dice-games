import THREE, { OrbitControls } from "./src/js/three";
import CANNON from "cannon";
import { DiceManager, DiceD6 } from "threejs-dice/lib/dice";
import Stats from "stats.js";
import * as vars from "./src/js/variables";
import Game from "./src/js/game";

// standard global variables
let container;
let scene;
let camera;
let renderer;
let controls;
let stats;
let world;
let dice = [];
let game;

function addCamera() {
	camera = new THREE.PerspectiveCamera(
		vars.VIEW_ANGLE,
		vars.ASPECT,
		vars.NEAR,
		vars.FAR
	);
	scene.add(camera);
	camera.position.set(0, 30, 30);
}

function addRenderer() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(vars.SCREEN_WIDTH, vars.SCREEN_HEIGHT);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function addLights() {
	const ambient = new THREE.AmbientLight("#ffffff", 0.3);
	scene.add(ambient);

	const directionalLight = new THREE.DirectionalLight("#ffffff", 0.5);
	directionalLight.position.x = -1000;
	directionalLight.position.y = 1000;
	directionalLight.position.z = 1000;
	scene.add(directionalLight);

	const light = new THREE.SpotLight(0xefdfd5, 0.5);
	light.position.y = 100;
	light.target.position.set(0, 0, 0);
	light.castShadow = true;
	light.shadow.camera.near = 70;
	light.shadow.camera.far = 110;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	scene.add(light);
}

function addStats() {
	stats = new Stats();
	stats.domElement.style.position = "absolute";
	stats.domElement.style.bottom = "0px";
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);
}

function createFloor() {
	const floorMaterial = new THREE.MeshPhongMaterial({
		color: vars.floorColor,
		side: THREE.DoubleSide
	});
	const floorGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.receiveShadow = true;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
}

function createSkyBox() {
	const skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
	const skyBoxMaterial = new THREE.MeshPhongMaterial({
		color: 0x9999ff,
		side: THREE.BackSide
	});
	const skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
	scene.add(skyBox);
	scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);
}

function createCANNONWorld() {
	world = new CANNON.World();

	world.gravity.set(0, -9.82 * 20, 0);
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 16;

	DiceManager.setWorld(world);

	//Floor
	let floorBody = new CANNON.Body({
		mass: 0,
		shape: new CANNON.Plane(),
		material: DiceManager.floorBodyMaterial
	});
	floorBody.quaternion.setFromAxisAngle(
		new CANNON.Vec3(1, 0, 0),
		-Math.PI / 2
	);
	world.add(floorBody);
}

function createDice() {
	for (let i = 0; i < 5; i++) {
		const die = new DiceD6({ size: 1.5, backColor: vars.colors[i] });
		scene.add(die.getObject());
		dice.push(die);
	}
}

export function randomDiceThrow() {
	const diceValues = [];

	for (let i = 0; i < dice.length; i++) {
		let yRand = Math.random() * 20;
		dice[i].getObject().position.x = -15 - (i % 3) * 1.5;
		dice[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5;
		dice[i].getObject().position.z = -15 + (i % 3) * 1.5;
		dice[i].getObject().quaternion.x =
			((Math.random() * 90 - 45) * Math.PI) / 180;
		dice[i].getObject().quaternion.z =
			((Math.random() * 90 - 45) * Math.PI) / 180;
		dice[i].updateBodyFromMesh();
		let rand = Math.random() * 5;
		dice[i].getObject().body.velocity.set(25 + rand, 10 + yRand, 15 + rand);
		dice[i]
			.getObject()
			.body.angularVelocity.set(
				20 * Math.random() - 10,
				20 * Math.random() - 10,
				20 * Math.random() - 10
			);

		diceValues.push({
			dice: dice[i],
			value: Math.floor(Math.random() * 6) + 1
		});
	}

	DiceManager.prepareValues(diceValues);

	return diceValues;
}

function updatePhysics() {
	world.step(1.0 / 60.0);

	for (let i in dice) {
		dice[i].updateMeshFromBody();
	}
}

function update() {
	controls.update();
	stats.update();
}

function init() {
	// Create scene
	scene = new THREE.Scene();

	addCamera();
	addRenderer();

	container = document.getElementById("ThreeJS");
	container.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);

	addStats();
	addLights();
	createFloor();
	createSkyBox();
	createCANNONWorld();
	createDice();

	// Call randomDiceThrow to initialize dice position (first throw)
	randomDiceThrow();
	requestAnimationFrame(animate);

	game = new Game();
}

function animate() {
	updatePhysics();
	render();
	update();

	requestAnimationFrame(animate);
}

function render() {
	renderer.render(scene, camera);
}

init();
