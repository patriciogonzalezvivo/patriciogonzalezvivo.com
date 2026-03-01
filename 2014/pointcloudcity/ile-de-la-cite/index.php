<?php
// Customize page metadata before including header
$page_title = "Point Cloud City - Île de la Cité - Patricio Gonzalez Vivo";
$page_description = "Point cloud visualization of Île de la Cité";
$page_keywords = "point cloud, 3D, visualization, Île de la Cité";

include("../../../header.php");
?>
		<!-- Override default style with inverted style -->
		<link href="/css/style-inv.css" rel="stylesheet" />
		<script type="text/javascript" src="https://www.google.com/jsapi"></script>

	</head>

	<body>
		<div id="main-wrapper">

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
				gl_FragColor = vColor;
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
