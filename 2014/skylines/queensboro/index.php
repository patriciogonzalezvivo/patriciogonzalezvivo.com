<?php include("../../../header.php");?>
<?php include("../../../menu.php");?>

		<section class="content">
			<?php
				include("../../../parsedown/Parsedown.php");
				$Parsedown = new Parsedown();
				echo $Parsedown->text(file_get_contents ('about.md'));
			?>	
		</section>

		<script src="/js/libs/Detector.js"></script>
		<script src="/js/libs/three.js"></script>
		<script src="/js/libs/OrbitControls.js"></script>
		<script src="/js/libs/stats.min.js"></script>
		<script src="/js/libs/dat.gui.min.js"></script>
		<script src="/js/libs/dat.gui.min.js"></script>	
		<script src="/js/libs/potree.min.js"></script>

		
		<script id="vertexShader" type="x-shader/x-vertex">
			uniform vec3 cameraPos;

			uniform float focusDistance;
			uniform float focusAperture;

			uniform float near;
			uniform float far;
			uniform float minSize;
			uniform float maxSize;

			varying vec4 vColor;

			const float PI = 3.14159265359;

			void main()	{

				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				gl_Position = projectionMatrix * mvPosition;

				float aper = focusAperture*0.01;
				float dist = focusDistance*(far*aper);

				vColor = vec4(color.rgb,
							  1.- pow( (2.0 * near) / (far + near - gl_Position.z * (far - near)), 2.) );

				float radius = min( 1.0 + abs(gl_Position.z - dist) * aper, maxSize)*0.5;
				vColor.a /= PI * radius * radius;

				gl_PointSize = max(minSize,1.0+maxSize*1.0/length( gl_Position.xyz ));
			}

		</script>

		<script id="fragmentShader" type="x-shader/x-fragment">
			varying vec4 vColor;

			void main()	{
				float luminance = dot(vec3(0.3, 0.59, 0.11), vColor.rgb);

				gl_FragColor.rgb = vec3(luminance);
				gl_FragColor.a = (1.-luminance)*vColor.a;
			}
		</script>

		<script src="pointcloud.js"></script>


		</div>

		<footer>
			<!-- <p>Copyright Patricio Gonzalez Vivo 2012</p> -->
		</footer>
	</body>
</html>

<?php include("../../footer.php"); ?>
