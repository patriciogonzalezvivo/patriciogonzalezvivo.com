if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var defaultFocusDistance = 0.01;
var defaultFocusAperture = 0.0;
var defaultLOD = 10;
var pointcloudPath = "../../skylines/ile-de-la-cite/cloud.js";

var camera, scene, renderer;

var pointcloud;
var pointclouds = [];
var pointcloudMaterial;

function initGUI(){
	var gui = new dat.GUI({
		height : 5 * 32 - 1
	});

	var params = {
		focusDistance: defaultFocusDistance,
		focusAperture: defaultFocusAperture,
		LOD: defaultLOD
	};

	var pLOD = gui.add(params, 'LOD', 0.5,20);
	pLOD.onChange(function(value){
		pointcloud.LOD = value;
	});

	var pfocusDistance = gui.add(params, 'focusDistance', 0.001, 1.0);
	pfocusDistance.onChange(function(value){
		pointcloudMaterial.uniforms.focusDistance.value = value;
	});

	var pfocusAperture = gui.add(params, 'focusAperture', 0.001, 1.0);
	pfocusAperture.onChange(function(value){
		pointcloudMaterial.uniforms.focusAperture.value = value;
	});
}

function initThree(){
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.01, 10000);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x000000,0);

	var container = document.createElement('div');
	container.classList.add('background');
	container.appendChild( renderer.domElement );
	document.body.appendChild(container);

	// camera and controls
	//
	camera.position.set(508,153,-223);
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set( 100, 3, -50 );
	camera.lookAt(controls.target);

	//	Grid
	//
	var grid = new THREE.GridHelper( 500, 10 );
	grid.setColors( 0x389586, 0x1c4b44 );
	grid.position.y = -35;
	scene.add( grid );

	//	Load Shader	
	//
	pointcloudMaterial = new THREE.ShaderMaterial( {
		uniforms: {
			cameraPos : { type: "v3", value: camera.position },
			far: { type: "f", value: 100000.0 },
			near: { type: "f", value: 1. },
			minSize: { type: "f", value: 1.},
			maxSize: { type: "f", value: 100. },
			focusDistance: { type: "f", value: defaultFocusDistance },
			focusAperture: { type: "f", value: defaultFocusAperture }
		},
		attributes: {},
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		vertexColors: true,
		transparent: true,
		alphaTest: 0.9
	} ); 

	// Load pointcloud
	//
	var pco = POCLoader.load(pointcloudPath);

	pointcloud = new Potree.PointCloudOctree(pco, pointcloudMaterial);
	pointcloud.LOD = defaultLOD;
	pointcloud.rotation.set(Math.PI*1.5,0,0);
	pointcloud.moveToOrigin();

	pointclouds.push(pointcloud);
	scene.add(pointcloud);
}

function render() {
	requestAnimationFrame(render);

	pointcloudMaterial.uniforms.cameraPos.value=camera.position;
	pointcloud.update(camera);
	renderer.render(scene, camera);
	// console.log(camera.position);
	controls.update(0.1);
};

initThree();
initGUI();
render();