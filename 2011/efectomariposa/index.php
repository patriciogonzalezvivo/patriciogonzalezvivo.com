<?php include("../../header.php");?>
<?php include("../../menu.php");?>


        <script src="https://fast.wistia.com/player.js" async></script><script src="https://fast.wistia.com/embed/v2o6ybyv6g.js" async type="module"></script><style>wistia-player[media-id='v2o6ybyv6g']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/v2o6ybyv6g/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style> <wistia-player media-id="v2o6ybyv6g" aspect="1.7777777777777777"></wistia-player>

        <div id="longer-info">
            <?php
            include("../../parsedown/Parsedown.php");
            $Parsedown = new Parsedown();
            echo $Parsedown->text(file_get_contents ('README.md'));
            ?>
        </div>
        
        <div id="longer-info">
            <div class="video-container">
                <!-- <iframe src="http://player.vimeo.com/video/32321634?autoplay=1" width="575" height="323" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe> -->
                    <iframe title="vimeo-player" src="https://player.vimeo.com/video/32321634?h=654b440c04" width="640" height="360" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"   allowfullscreen></iframe>
            </div>
            <a href="https://vimeo.com/32321634" target="_blank">
            <div id="myslides" class="photo" style="">
                <!-- <img class="photo" src="puyehue-04.jpg" style="width: 100%; height: 640px; object-fit: cover;"/> -->
                <img class="photo" src="images/01.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/02.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/03.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/04.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/05.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/06.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/07.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/08.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/09.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/10.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/11.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/12.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/13.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/14.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/15.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/16.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/17.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/18.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/19.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/20.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/21.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/22.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/23.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/24.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/25.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
                <img class="photo" src="images/26.jpg" style="width: 100%; height: 640px; object-fit: cover;" alt="slide"/>
            </div></a>  

            <article>
                <p>Spacial thanks to:</p>
                <p>- CCEBA coordinators and jury: Emiliano Causa, Matias Romero Costas and Federico Joselevich</p>
                <p>- Volcanic Ash: Andres Rey and Juan Rey</p>
                <p>- Ironworks: Juan Manuel Toconas</p>
                <p>- Model of the rock: Fabian Nonino</p>
                <p>- Teaching of openGL and Shader Lenguajes: Fabricio Costa</p>
                <p>- Logo and app icons Design: Jovana de Obaldia</P>
                <p>- Photography and Video: Joaquin Aras, Agustin Anzorena y Tomas Rawski</p>
            </article>

            <div>
                <a href="http://www.cceba.org.ar/"><img src="sponsor.jpg" alt="sponsor"/></a>
                <a href="http://www.cceba.org.ar/"><img src="sponsor_2.jpg" alt="sponsor"/></a>
            </div>

        </div>
        
<?php include("../../footer.php"); ?>
