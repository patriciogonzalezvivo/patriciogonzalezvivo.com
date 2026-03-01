<?php include("../../header.php");?>
<?php include("../../menu.php");?>


	<!-- CONTENT -->
	<section class="content">
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/7i3Z6-xzd1k" frameborder="0" allowfullscreen></iframe>
		</div>
		
		<article>
			<p> Sketches for Audio/Visual Systems (Spring 2013) with <a href="http://thesystemis.com/" target="_blank">Zach Lieberman</a> </p>
			<p> Check the code at <a href="https://github.com/patriciogonzalezvivo/patriciogv_avsys2013" target="_blank">https://github.com/patriciogonzalezvivo/patriciogv_avsys2013</a> </p>
		</article>
		
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/RlajGiuiriI" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/XfMeiCZIJJE" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/Cne3TcSL8zI" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/animTiTXy3I" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/HN1HaVOpAn8" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/ZrzddeLHBhI" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/5bSuaqcx3nk" frameborder="0" allowfullscreen></iframe>
		</div>
		
		<script id="vertexShader" type="x-shader/x-vertex">
			void main()	{
				gl_Position = vec4( position, 1.0 );
			}
		</script>
		
		<script id="fragmentShader" type="x-shader/x-fragment">
			uniform float time;
			uniform vec2 resolution;

			float rand(vec2 n) { 
				return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
			}

			float noise(vec2 n) {
				const vec2 d = vec2(0.0, 1.0);
				vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
				return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
			}

			void main( void ) {
				vec2 p = ( gl_FragCoord.xy / resolution.xy-0.5)  ;

				float color =0.;
				float Mx = 22.;
				for ( float i   =22. ; i >8.; i-- ){
					color   *=  0.8;
					color   =   pow(color,1.1);
					float a = p.y + sin(p.x*(1.+i*0.5)+time*2.+sin(time*(0.2 + i*0.0001))*5.0+noise(vec2(time*(0.5+i*0.1),p.x*(0.5+i*10.0))))*0.005*i-0.35*sin(time+i*0.2);
					color   +=  max(0.0,pow(1.0-abs(a),500.)+pow(1.0-abs(a),20.)*0.4);
				}
				gl_FragColor = vec4( vec3( 1.0-color ), 1.0 );
			}
		</script>
		
	</section>
	
<?php include("../../footer.php"); ?>
