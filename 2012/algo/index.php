<?php include("../../header.php");?>
<?php include("../../menu.php");?>
<?php include("../../sidebar.php");?>

	<!-- CONTENT -->
	<section class="content">
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/bi0snTaTTd0" frameborder="0" allowfullscreen></iframe>
		</div>
		
		<article>
			<p> Sketches for Algorithmic Animation FALL'2012 with <a href="http://thesystemis.com/" target="_blank">Zach Lieberman</a> </p>
			<p> Check the code at <a href="https://github.com/patriciogonzalezvivo/patriciogv_algo2012" target="_blank">https://github.com/patriciogonzalezvivo/patriciogv_algo2012</a> </p>
		</article>
		
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/IRKU42zzoeQ" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/cWb62BN-oRs" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/MCDP4CS6UiI" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/yov6hXXkMMs" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/y629rn6DDv8" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/Jhz3pC6umUY" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/ZrkVL-VpKEI" frameborder="0" allowfullscreen></iframe>
		</div>
		<div class="video-container">
			<iframe width="575" height="382" src="//www.youtube.com/embed/rIdYl1QOchc" frameborder="0" allowfullscreen></iframe>
		</div>
		
		<script id="vertexShader" type="x-shader/x-vertex">
		void main()	{
			gl_Position = vec4( position, 1.0 );
		}
	</script>
		
	<script id="fragmentShader" type="x-shader/x-fragment">
		uniform vec2 resolution;
		uniform float mouseX;
		uniform float mouseY;
		uniform float time;

		#define LAYERS 10
		#define DEPTH .5
		#define WIDTH .3
		#define SPEED .3
		
		void main(void){
			const mat3 p = mat3(13.323122,23.5112,21.71123,21.1212,28.7312,11.9312,21.8112,14.7212,61.3934);
			vec2 mouse = vec2(mouseX,mouseY);
			vec2 uv = mouse.xy/resolution.xy + vec2(1.,resolution.y/resolution.x)*gl_FragCoord.xy / resolution.xy;
	
			vec3 acc = vec3(0.0);
			float dof = 5.*sin(time*.1);
			for (int i=0;i<LAYERS;i++) {
				float fi = float(i);
				vec2 q = uv*(1.+fi*DEPTH);
				q += vec2(q.y*(WIDTH*mod(fi*7.238917,1.)-WIDTH*.5),SPEED*time/(1.+fi*DEPTH*.03));
				vec3 n = vec3(floor(q),31.189+fi);
				vec3 m = floor(n)*.00001 + fract(n);
				vec3 mp = (31415.9+m)/fract(p*m);
				vec3 r = fract(mp);
				vec2 s = abs(mod(q,1.)-.5+.9*r.xy-.45);
				s += .01*abs(2.*fract(10.*q.yx)-1.); 
				float d = .6*max(s.x-s.y,s.x+s.y)+max(s.x,s.y)-.01;
				float edge = .005+.05*min(.5*abs(fi-5.-dof),1.);
				acc += vec3(smoothstep(edge,-edge,d)*(r.x/(1.+.02*fi*DEPTH)));
			}
			gl_FragColor = vec4(vec3(1.0-acc),1.0);
		}
		</script>
		
	</section>
	
<?php include("../../footer.php"); ?>
