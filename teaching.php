<?php
include("project_meta.php");

    $projects = [
        ['path' => '2022/shader_prototyping', 'url' => 'https://maximalexpression.notion.site/SHADER-PROTOTYPING-146da33982c54746a0589ebcbdbf717a', 'title' => 'Shader Prototyping Course', 'year' => '2022', 'thumbnail' => '2022/shader_prototyping/momento_006.gif'],
        ['path' => '2016/sfpc', 'title' => 'Introduction to the Language of Light', 'year' => '2016', 'medium' => 'School for Poetic Computation'],
        ['path' => '2015/shaderstudio', 'title' => 'Shader Studio', 'year' => '2016', 'medium' => 'Parsons MFA D&T'],
        ['path' => '2015/thebookofshaders', 'url' => 'https://thebookofshaders.com/', 'title' => 'The Book of Shaders', 'year' => '2015', 'medium' => 'Book'],
        ['path' => '2014/sims', 'title' => 'Simulation Studio', 'year' => '2014', 'medium' => 'Parsons MFA D&T'],
        ['path' => '2013/bootcamp', 'title' => 'Code Faculty', 'year' => '2013', 'medium' => 'Parsons MFA DT Bootcamp'],
        ['path' => '2012/shellinitiation', 'url' => 'http://github.com/patriciogonzalezvivo/Shell-Initiation', 'title' => 'ShellInitiation', 'year' => '2012'],
        ['path' => '2012/ccgsm', 'title' => 'openFrameworks Workshops', 'year' => '2012', 'medium' => 'CCGSM, Buenos Aires'],
        ['path' => '2011/iuna', 'title' => 'Informatics applied to Art II and Multimedia IV', 'year' => '2011', 'medium' => 'IUNA, Buenos Aires'],
        ['path' => '2010/calos', 'title' => 'Expressive Art Therapy Workshop', 'year' => '2010', 'medium' => 'CALOS, Buenos Aires'],
        ['path' => '2007/usal', 'title' => 'Creative Connection@', 'year' => '2007', 'medium' => 'Salvador University, Buenos Aires'],
    ];

set_random_og_image($projects);

include("header.php");
include("menu.php");
?>
    <section class="content">
<?php echo render_projects_list($projects); ?>
    </section>

<?php include("footer.php"); ?>
