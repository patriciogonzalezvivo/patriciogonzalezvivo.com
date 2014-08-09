var defaultPointSize = 0.1;
var defaultLOD = 20;
var pointcloudPath = "cloud.js";

var renderer;
var camera;
var scene;
var pointclouds = [];
var stats;
var pointcloudMaterial;

function initGUI(){
	var gui = new dat.GUI({
		height : 5 * 32 - 1
	});

	var params = {
		PointSize: defaultPointSize,
		LOD: defaultLOD
	};

	var pLOD = gui.add(params, 'LOD', 0.5,20);
	pLOD.onChange(function(value){
				//pointCloud.LOD = value;
				for(var i = 0; i < pointclouds.length; i++){
					pointclouds[i].LOD = value;
				}
			});

	var pPointSize = gui.add(params, 'PointSize', 0.001, 1.0);
	pPointSize.onChange(function(value){
		pointcloudMaterial.size = value;
	});
}

function initThree(){

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.01, 10000);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.style.backgroundColor = '#00ff00';
	renderer.setClearColor(0xFFFFFF,0);

	var container = document.createElement('div');
	container.classList.add('background');
	container.appendChild( renderer.domElement );
	document.body.appendChild(container);

	// camera and controls
	camera.position.set(508,153,-223);
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set( 100, 3, -50 );
	camera.lookAt(controls.target);

	pointcloudMaterial = new THREE.PointCloudMaterial( { size: defaultPointSize, vertexColors: true } );
			
	// load pointcloud
	var pco = POCLoader.load(pointcloudPath);

	var pointcloud = new Potree.PointCloudOctree(pco, pointcloudMaterial);
	pointcloud.LOD = defaultLOD;
	pointcloud.rotation.set(Math.PI*1.5,0,0);
	pointcloud.moveToOrigin();

	pointclouds.push(pointcloud);
	scene.add(pointcloud);
}

function render() {
	requestAnimationFrame(render);

	var numVisibleNodes = 0;
	var numVisiblePoints = 0;
	for(var i = 0; i < pointclouds.length; i++){
		var pointcloud = pointclouds[i];
		pointcloud.update(camera);
		numVisibleNodes += pointcloud.numVisibleNodes;
		numVisiblePoints += pointcloud.numVisiblePoints;
	}

	renderer.render(scene, camera);
	console.log(camera.position);

	controls.update(0.1);
};

initThree();
initGUI();
render();