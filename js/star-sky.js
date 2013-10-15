var mouseX = 0;
var mouseY = 0;
var camera, scene, renderer;

window.onload = function(){
	init();
	animate();
}
			
function getStar(index){
	for(var i=0; i<stars.length; i++) {
		if(stars[i].id == index){
			return stars[i];
		}
	}
}
			
function init() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1;
				
	var mouseX = 0, mouseY = 0;
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

	renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
				
	var container = document.createElement('div');
	container.classList.add('background');
	container.appendChild( renderer.domElement );
	document.body.appendChild(container);
				
	//	Load Particles form Stars positions
	//
	var particles;
	var radius = 1500;
	var numParticles = stars.length;
	var m = mat4.create();
	for ( var i=0; i<numParticles; i++) {
		var s = stars[i];

		var v = vec3.create([radius, 0, 0]);
		mat4.identity(m);

		mat4.rotateY(m, s.ra*Math.PI/180);
		mat4.rotateZ(m, -s.de*Math.PI/180);
		mat4.multiplyVec3(m, v);
					
		if ( v[1] > 0){
			var PI2 = Math.PI * 2;
			var material = new THREE.ParticleCanvasMaterial( { 
				color: 0x000000, 
				opacity: 0.5,
				program: function ( context ) {
					context.beginPath();
					context.arc( 0, 0, 1, 0, PI2, true );
					context.fill();
				} 
			} );
					
			var particle = new THREE.Particle( material );
			particle.position.x = v[0];
			particle.position.y = v[1];
			particle.position.z = v[2];
					
			scene.add( particle );
		}
					
	}
				
	//	Load Constelations
	//
	var s = 1;
	var count = 0;

	for(var i=0; i<constellations.length; i++) {
		var lines = constellations[i].lines;
		for (var j=0; j<lines.length; j++) {
			var i0 = lines[j][0];
			var i1 = lines[j][1];
			var s0 = getStar(i0);
			var s1 = getStar(i1);

			var p0 = vec3.create([radius, 0, 0]);
			mat4.identity(m);
				
			mat4.rotateY(m, s0.ra*Math.PI/180);
			mat4.rotateZ(m, -s0.de*Math.PI/180);
			mat4.multiplyVec3(m, p0);

			var p1 = vec3.create([radius, 0, 0]);
			mat4.identity(m);
				
			mat4.rotateY(m, s1.ra*Math.PI/180);
			mat4.rotateZ(m, -s1.de*Math.PI/180);

			mat4.multiplyVec3(m, p1);

			if (p0[1] > 0 && p1[1] > 0){
				var geometry = new THREE.Geometry();

				var a = new THREE.Vector3( p0[0], p0[1], p0[2]);
				var b = new THREE.Vector3( p1[0], p1[1], p1[2]);
						
				geometry.vertices.push( a );
				geometry.vertices.push( b );
				var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.1 } ) );
				scene.add( line );

				count ++;
			}
		}
	}

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
				
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
			
function onDocumentMouseMove(event) {
	mouseX = (event.clientX/window.innerWidth);
	mouseY = (event.clientY/window.innerHeight);
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	camera.position.x += ( mouseX - camera.position.x ) * .01;
	camera.position.y += ( -mouseY - camera.position.y ) * .01;
	camera.lookAt( scene.position );

	renderer.render( scene, camera );
}