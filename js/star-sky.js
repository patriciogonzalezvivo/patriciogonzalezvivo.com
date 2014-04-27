var PI = Math.PI;
var TWO_PI = 2 * Math.PI;
var SINCOS_LENGTH = 720;
var RAD_TO_DEG = 180 / PI;
var DEG_TO_RAD = PI / 180;
var sinLUT = new Float32Array(SINCOS_LENGTH);
var cosLUT = new Float32Array(SINCOS_LENGTH);
for (var i = 0; i < SINCOS_LENGTH; i++) {
	sinLUT[i] = Math.sin(i * DEG_TO_RAD * 0.5);
  cosLUT[i] = Math.cos(i * DEG_TO_RAD * 0.5);
}

var mouseX = 0;
var mouseY = 0;

var camera, scene, renderer;

window.onload = function(){
	init();
	animate();
};

function getStar(index){
	for(var i=0; i<stars.length; i++) {
		if(stars[i].id == index){
			return stars[i];
		}
	}
};

function p5arc(context, x, y, width, height, start, stop) {
      x = x - width/2;
      y = y - height/2;

      // make sure that we're starting at a useful point
      //
      while (start < 0) {
        start += TWO_PI;
        stop += TWO_PI;
      }

      if (stop - start > TWO_PI) {
        start = 0;
        stop = TWO_PI;
      }

      var hr = width / 2,
          vr = height / 2,
          centerX = x + hr,
          centerY = y + vr,
          startLUT = 0 | (0.5 + start * RAD_TO_DEG * 2),
          stopLUT = 0 | (0.5 + stop * RAD_TO_DEG * 2),
          i, j;

	  context.moveTo(centerX, centerY);
		context.beginPath();
      for (i = startLUT; i <= stopLUT; i++) {
        j = i % SINCOS_LENGTH;
        context.lineTo(centerX + cosLUT[j] * hr, centerY + sinLUT[j] * vr);
      }
		context.closePath();
};

function init() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1;

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
	var radius = 200;
	var numParticles = stars.length;
	var m = mat4.create();
	for ( var i=0; i<numParticles; i++) {
		var s = stars[i];

		var v = vec3.create([Math.log(s.distance)*radius, 0, 0]);
		mat4.identity(m);

		mat4.rotateY(m, s.ra*DEG_TO_RAD);
		mat4.rotateZ(m, -s.de*DEG_TO_RAD);
		mat4.multiplyVec3(m, v);

		if ( v[1] > 0){
			var material = new THREE.ParticleCanvasMaterial( {
				color: 0x000000,
				opacity: 0.5,//(v[1] > 0)? 0.5:0.25 ,
				program: function ( context ) {
					context.beginPath();
					context.arc( 0, 0, 1, 0, TWO_PI, true );
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

			var p0 = vec3.create([Math.log(s0.distance)*radius, 0, 0]);
			mat4.identity(m);

			mat4.rotateY(m, s0.ra*DEG_TO_RAD);
			mat4.rotateZ(m, -s0.de*DEG_TO_RAD);
			mat4.multiplyVec3(m, p0);

			var p1 = vec3.create([Math.log(s1.distance)*radius, 0, 0]);
			mat4.identity(m);

			mat4.rotateY(m, s1.ra*DEG_TO_RAD);
			mat4.rotateZ(m, -s1.de*DEG_TO_RAD);

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

	//	Load Moon
	//
	{
		var lat = 40.77;
		var lon = -73.94;
		var moonPhase = SunCalc.getMoonFraction(new Date());
		var moonPos = SunCalc.getMoonPosition(new Date(), lat, lon);
		var moonMatrix = mat4.create();
		var moon3Vec = vec3.create([0, 0, radius]);

		console.log("The moon is at " + moonPos.altitude);
		console.log("My moon is at " + 215*DEG_TO_RAD );
		mat4.identity(moonMatrix);
		mat4.rotateX(moonMatrix, 215*DEG_TO_RAD);	//+moonPos.altitude);
		mat4.rotateY(moonMatrix, 25*DEG_TO_RAD);	//+moonPos.azimuth);
		mat4.multiplyVec3(moonMatrix, moon3Vec);

		var material = new THREE.ParticleCanvasMaterial( {
			color: 0x999999,
			opacity: 1.0,
			program: function ( context ) {
				var r = 10;
				var m = (moonPhase-0.5)*2.0;

				var a = m*r;
				var b = (m*-1.0)*r;

				context.fillStyle = '#2e2f2f';
				p5arc(context, 0,0, r, r, PI/2, TWO_PI-PI/2);
				if (a>=0){
					p5arc(context, 0,0, a,r, TWO_PI-PI/2,TWO_PI);	//top moving half
					p5arc(context, 0,0, a,r, 0,PI/2);							//bottom moving half
				}
				context.fill();

				if(b>=0){
					context.fillStyle = '#ffffff';
					p5arc(context, 1,0, b,r, PI/2,TWO_PI-PI/2);
					context.fill();
				}
			}
		} );

		var particle = new THREE.Particle( material );
		particle.position.x = moon3Vec[0];
		particle.position.y = moon3Vec[1];
		particle.position.z = moon3Vec[2];

		scene.add( particle );
	}

	var mouseX = 0, mouseY = 0;
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;

	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX/window.innerWidth-0.5)*2.0;
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
