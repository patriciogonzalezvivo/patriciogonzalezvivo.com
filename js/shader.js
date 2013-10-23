
var camera, scene, renderer;
var uniforms, material, mesh;
var mouseX = 0, mouseY = 0, lat = 0, lon = 0, phy = 0, theta = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

window.onload = function(){
	init();
	animate();
}

function init() {
	camera = new THREE.Camera();
	camera.position.z = 1;

	scene = new THREE.Scene();

	uniforms = {
		mouseX: { tipe:"f", value: 0.0},
		mouseY: { tipe:"f", value: 0.0},
		time: { type: "f", value: 1.0 },
		resolution: { type: "v2", value: new THREE.Vector2() }
	};

	material = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	} );

	mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();
	
	var container = document.createElement('div');
	container.classList.add('background');
	container.appendChild(renderer.domElement);
	document.body.appendChild(container);
	
	onWindowResize();
	window.addEventListener('resize', onWindowResize, false );
}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX/window.innerWidth);
	mouseY = (event.clientY/window.innerHeight);
}

function onWindowResize( event ) {
	uniforms.resolution.value.x = window.innerWidth;
	uniforms.resolution.value.y = window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	uniforms.time.value += 0.01;
	uniforms.mouseX.value = mouseX;
	uniforms.mouseY.value = mouseY;
	renderer.render( scene, camera );
}