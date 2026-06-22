// #version 120

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_scene;
uniform vec3        u_lightColor;
uniform vec3        u_light;

uniform sampler2D   u_buffer0; // 512x512
uniform sampler2D   u_buffer1; // 512x512
uniform sampler2D   u_buffer2; // 512x512
uniform sampler2D   u_buffer3; // 512x512

uniform vec3        u_camera;
uniform vec2        u_resolution;
uniform float       u_time;
uniform int         u_frame;

varying vec4        v_color;
varying vec2        v_texcoord;

#ifndef CARD_FNC
#define CARD_FNC magician
#endif

#define LIM 0.0004

#include "lygia/math/const.glsl"
#include "lygia/math/mirror.glsl"
#include "lygia/math/powFast.glsl"
#include "lygia/math/saturate.glsl"
#include "lygia/math/decimate.glsl"
#include "lygia/space/scale.glsl"
#include "lygia/space/ratio.glsl"
#include "lygia/space/scale.glsl"
#include "lygia/space/rotateX.glsl"
#include "lygia/space/rotateY.glsl"
#include "lygia/space/rotateZ.glsl"

#include "lygia/color/space/linear2gamma.glsl"
#include "lygia/color/space/gamma2linear.glsl"
#include "lygia/color/blend/screen.glsl"
#include "lygia/generative/random.glsl"
#include "lygia/generative/curl.glsl"

#include "lygia/sdf/circleSDF.glsl"
#include "lygia/sdf/polySDF.glsl"
#include "lygia/sdf/raysSDF.glsl"
#include "lygia/sdf/starSDF.glsl"
#include "lygia/sdf/flowerSDF.glsl"
#include "lygia/sdf/spiralSDF.glsl"

#include "lygia/sdf/tetrahedronSDF.glsl"
#include "lygia/sdf/cubeSDF.glsl"
#include "lygia/sdf/octahedronSDF.glsl"
#include "lygia/sdf/dodecahedronSDF.glsl"
#include "lygia/sdf/icosahedronSDF.glsl"

#include "lygia/sdf/sphereSDF.glsl"
#include "lygia/sdf/boxFrameSDF.glsl"
#include "lygia/sdf/cylinderSDF.glsl"
#include "lygia/sdf/pyramidSDF.glsl"
#include "lygia/sdf/torusSDF.glsl"
#include "lygia/sdf/triPrismSDF.glsl"
#include "lygia/sdf/hexPrismSDF.glsl"
#include "lygia/sdf/octogonPrismSDF.glsl"

#include "lygia/sdf/opUnion.glsl"
#include "lygia/sdf/opSubtraction.glsl"
#include "lygia/sdf/opIntersection.glsl"

#ifndef STR_MATERIAL
#define STR_MATERIAL
struct Material { float sdf; };
#endif

#define BARREL_TYPE vec3
#define BARREL_SAMPLER_FNC(TEX, UV) texture2D(TEX, UV).rgb
#define BARREL_DISTANCE -(dist*dist)
#include "lygia/distort/barrel.glsl"

#define CHROMAAB_TYPE vec3
#define CHROMAAB_CENTER_BUFFER .18
#define CHROMAAB_SAMPLER_FNC(TEX, UV) barrel(TEX, UV, 0.1-offset.x).rgb
#include "lygia/distort/chromaAB.glsl"

float ring(in vec3 p, float w, float h) {
    float sdf = 1.0;
    sdf = min( sdf, opSubtraction(  cylinderSDF(p, 1.2, 0.25 * h), 
                                    cylinderSDF(p, 1.2 + w, 0.1 * h)) );
    return sdf;
}

float ring(in vec3 p, float w) {
    return ring(p, w, 1.);
}

float logo (in vec3 p) {
    float sdf = 1.0;
    sdf = ring(p, 0.2);
    sdf = opUnion( sdf, cylinderSDF(p + vec3(0.0, 0.0, -0.6), 0.5, 0.2) );
    sdf = opUnion( sdf, cylinderSDF(p + vec3(0.5, 0.0, 0.25), 0.5, 0.2) );
    sdf = opUnion( sdf, cylinderSDF(p + vec3(-0.5, 0.0, 0.25), 0.5, 0.2) );
    sdf = opSubtraction( triPrismSDF(vec3(p.x, (1.-p.z) - .95, p.y), vec2(.3, 2.)), sdf);

    return sdf;
}

float magician (in vec3 p) {
    float sdf = 1.;
    p *= 2.0;
    vec3 gap = vec3(0.7,0.0,0.0);
    p = rotateX(p, PI * -0.1);
    sdf = opUnion( sdf, torusSDF(p + gap, vec2(1.3, 0.2)) );
    p = rotateX(p, PI * 0.2);
    sdf = opUnion( sdf, torusSDF(p - gap, vec2(1.3, 0.2)), 1. );
    return sdf;
}

float highPriestess (in vec3 p) {
    float sdf = 1.;
    sdf = min(sdf, torusSDF(p, vec2(1., .1)));
    return sdf;
}

float empress (in vec3 p) {
    float sdf = 1.;
    p = rotateZ(p, 2.2);
    sdf = min(sdf, dodecahedronSDF(p, 1.));
    sdf = opSubtraction( dodecahedronSDF(p, .8), sdf);
    p = rotateZ(p, PI * 0.325);
    p = rotateY(p, PI * -0.3);
    sdf = opSubtraction( polySDF( (p.xz + 1.) * 0.5, 5) - 0.5, sdf);
    // p = rotateX(p, u_time);
    // sdf = min(sdf, dodecahedronSDF(p, .3));
    sdf = min(sdf, sphereSDF(p) - .2);
    return sdf;
}

float emperator (in vec3 p) {
    float sdf = 1.;
    sdf = opUnion( sdf, boxFrameSDF(p, vec3(1.0), 0.1 ) );
    sdf = opUnion( sdf, boxSDF(p, vec3(0.15) ) );
    return sdf;
}

float hierophant (in vec3 p) {
    float sdf = 1.;
    float w = 0.33;
    float h = 1.0;
    // sdf = opUnion( sdf, boxFrameSDF(p, vec3(0.8), 0.05 ) );
    // sdf = opUnion( sdf, boxFrameSDF(p, vec3(0.9), 0.02 ) );
    // p = rotateZ(p, -u_time);
    sdf = opUnion( sdf, boxSDF(p, vec3(w, w, h) ) );
    sdf = opUnion( sdf, boxSDF(p, vec3(w, h, w) ) );
    sdf = opUnion( sdf, boxSDF(p, vec3(h, w, w) ) );
    return sdf;
}

float heartSDF(vec3 p) {
    vec3 pp = p * p;
    vec3 ppp = pp * p;
    float a = pp.x + 2.25 * pp.y + pp.z - 1.0;
    return a * a * a - (pp.x + 0.1125 * pp.y) * ppp.z;
}

float lovers (in vec3 p) {
    float sdf = 1.;
    sdf = min(sdf, heartSDF(p)); 
    sdf = opSubtraction( triPrismSDF(p.xzy, vec2(.3, 2.)), sdf);
    return sdf;
}

float chariot (in vec3 p) {
    float sdf = 1.;
    p = rotateZ(p, -u_time * 0.1);
    sdf = opUnion( sdf, boxFrameSDF(p, vec3(0.8), 0.1 ) );
    p = rotateX(p, QTR_PI);
    p = rotateY(p, -u_time * 0.25);
    sdf = opUnion( sdf, boxFrameSDF(p, vec3(0.8), 0.1 ) );
    return sdf;
}

float strength (in vec3 p) {
    float sdf = 1.;
    p *= 1.2;
    p.z *= 0.8;
    p = rotateZ(p, 1.6);
    p = rotateX(p, p.x * QTR_PI);
    sdf = min(sdf, torusSDF(p, vec2(1., .25)));
    return sdf;
}

float hermit (in vec3 p) {
    float sdf = 1.;
    p = rotateZ(p, QTR_PI);
    sdf = min(sdf, octahedronSDF(p + vec3(0.0,0.0,0.5), 1.5 ) );
    sdf = opSubtraction( boxSDF(p.yzx + vec3(0.0, 2.0, 0.0), vec3(1.5)), sdf);
    p = rotateZ(p, QTR_PI);
    sdf = opSubtraction( triPrismSDF(p.xzy - vec3(0.0,0.5,0.0), vec2(.3, 2.)), sdf);
    sdf = opSubtraction( triPrismSDF(vec3(p.x, 1.0-p.z, p.y) - vec3(0.0,.76,0.0), vec2(.3, 2.)), sdf);
    p = rotateZ(p, HALF_PI);
    sdf = opSubtraction( triPrismSDF(p.xzy - vec3(0.0,0.5,0.0), vec2(.3, 2.)), sdf);
    sdf = opSubtraction( triPrismSDF(vec3(p.x, 1.0-p.z, p.y) - vec3(0.0,.76,0.0), vec2(.3, 2.)), sdf);
    return sdf;
}

float fortune (in vec3 p) {
    p *= 1.2;
    float sdf = 1.;

    float s = 1.6;
    float w = 0.1;
    vec3 p1 = rotateZ(p, QTR_PI);
    vec3 p2 = rotateY(p1, PI * 0.2);
    sdf = opUnion( sdf, boxSDF(p2, vec3(s,w,w)) );
    vec3 p3 = rotateY(p1, PI * 0.8);
    sdf = opUnion( sdf, boxSDF(p3, vec3(s,w,w)) );
    vec3 p4 = rotateZ(p, -QTR_PI);
    vec3 p5 = rotateY(p4, PI * 0.2);
    sdf = opUnion( sdf, boxSDF(p5, vec3(s,w,w)) );
    vec3 p6 = rotateY(p4, PI * 0.8);
    sdf = opUnion( sdf, boxSDF(p6, vec3(s,w,w)) );
    sdf = opSubtraction( boxSDF(p, vec3(0.4)), sdf);
    sdf = opUnion( sdf, boxFrameSDF(p, vec3(1.0), w ) );
    sdf = opUnion( sdf, boxFrameSDF(p, vec3(0.4), w ) );

    // float s = 1.2;
    // float w = 0.1;
    // sdf = opUnion( sdf,  octogonPrismSDF(p.xzy, 1.5, .2) );
    // sdf = opSubtraction( octogonPrismSDF(p.xzy, 1.2, .3), sdf);
    // sdf = opUnion( sdf, boxSDF(p.xyz, vec3(s,w,w)) );
    // sdf = opUnion( sdf, boxSDF(p.zyx, vec3(s,w,w)) );
    // vec3 p1 = rotateY(p, QTR_PI);
    // sdf = opUnion( sdf, boxSDF(p1.xyz, vec3(s,w,w)) );
    // sdf = opUnion( sdf, boxSDF(p1.zyx, vec3(s,w,w)) );
    // sdf = opSubtraction( sphereSDF(p, .3), sdf);
    // sdf = opUnion( sdf, ring(p.zyx * 5., 0.5, 10.));

    return sdf;
}

float justice (in vec3 p) {
    float sdf = 1.0;
    p *= 1.5;
    // p.z += 2.0 + sin(u_time * 0.05) * 2.5;
    p.z += fract(u_time * 0.025) * 4.;
    sdf = opUnion( sdf, hexPrismSDF(p * vec3(0.5,1.5,0.5), vec2(.2, 1.)) );
    sdf = opUnion( sdf, hexPrismSDF(p.yzx * vec3(0.9,1.,1.) - vec3(0.,2.,0.), vec2(.3 * (1.0-abs(p.x * 0.5)), 1.5)) );
    sdf = opUnion( sdf, cylinderSDF(p.xzy * vec3(1.,1.05,1.5) - vec3(0.,3.,0.), .3 * (sin(p.z*0.8) * 0.5 + 0.5), 1.0) );
    sdf = opUnion( sdf, ring(p * 5. - vec3(0.,0.,20.), .5, 5.));
    return sdf;
}

float hanged (in vec3 p) {
    float sdf = 1.0;
    float gap = 0.2;
    sdf = min(sdf, octahedronSDF(p, 1.7 ));
    sdf = opSubtraction( boxSDF(p, vec3(gap,2.,2.)), sdf);
    sdf = opSubtraction( boxSDF(p, vec3(2.,gap, 2.)), sdf);
    return sdf;
}

float death (in vec3 p) {
    float sdf = 1.0;

    p *= 1.5;

    p.x = -p.x;
    p = rotateY(p, -QTR_PI);

    p.x += 2.0; 
    p.y *= 3.0;
    sdf = opUnion( sdf, tetrahedronSDF(p.yxz, 1.0) );

    return sdf;
}

float temperance (in vec3 p) {
    p.xy = p.yx;

    float sdf = 1.0;
    float w = 0.15;
    float h = 0.5;
    vec3 gap = vec3(.0,.6,.0);
    p.y += sin(u_time * 0.2 + p.z * 1.25) * 0.5;
    sdf = opUnion( sdf, boxSDF(p - gap, vec3(h,w,3.)) );
    sdf = opUnion( sdf, boxSDF(p, vec3(h,w,3.)) );
    sdf = opUnion( sdf, boxSDF(p + gap, vec3(h,w,3.)) );

    return sdf;
}

float devil (in vec3 p) {
    float sdf = 1.;

    p.z = -p.z;
    sdf = ring(p, 0.2);
    float s = starSDF(p.zx + 0.5, 5, .1) * step(abs(p.y), 0.2);
    sdf = opUnion( sdf, s * 0.5 - 1.0);
    sdf = opSubtraction( s - 1.0, sdf);

    return sdf;
}

float tower (in vec3 p) {
    float sdf = 1.;
    p *= 1.25;
    float s = sin(p.z * 0.5) * 0.1;
    vec3 p1 = rotateY(p, QTR_PI);
    sdf = opUnion( sdf, boxSDF(p, vec3(0.5 - s, 0.5 - s, 1.5) ) );
    sdf = opSubtraction( boxSDF(p1, vec3(1., 1., 0.1) ) , sdf);
    vec3 p2 = p - vec3(0.,0.,1.5);
    sdf = opSubtraction( boxSDF(p2, vec3(0.1, 1., .2) ), sdf);
    sdf = opSubtraction( boxSDF(p2.yxz, vec3(0.1, 1., .2) ), sdf);
    sdf = opSubtraction( boxSDF(p2.yxz, vec3(0.3) ), sdf);
    return sdf;
}

float star (in vec3 p) {
    float sdf = 1.0;

    vec3 p1 = p;
    // p1 = rotateZ(p1, u_time);
    sdf = opUnion( sdf, ( raysSDF(p1.xz + 0.5, 15) * 2.0 - step(abs(p1.y), 0.05))  );

    // vec3 p2 = rotateX(p, u_time);
    // sdf = opUnion( sdf, ( raysSDF(p2.xz + 0.5, 15) * 2.0 - step(abs(p2.y), 0.1))  );

    float s = starSDF(p.zx + 0.5, 6, .09);
    sdf = opUnion( sdf, s * 0.5 - step(abs(p.y), 0.25));

    return sdf;
}

float moon (in vec3 p) {
    float sdf = 1.0;
    sdf = opUnion( sphereSDF(p, 1.0), sdf );
    sdf = opSubtraction(  cylinderSDF(p - 0.3, 0.7, 2.), sdf );
    return sdf;
}

float sun (in vec3 p) {
    float sdf = 1.0;
    p *= 1.5;
    vec3 p1 = p;
    sdf = opUnion( sdf, hexPrismSDF(p1 * vec3(0.2,.35,0.2), vec2(.1 * (cos(p1.z*.85)), .5)) );
    sdf = opUnion( sdf, hexPrismSDF(p1.zyx * vec3(0.2,.35,0.2), vec2(.1 * (cos(p1.x*.85)), .5)) );
    p1 = rotateY(p1, QTR_PI);
    sdf = opUnion( sdf, hexPrismSDF(p1 * vec3(0.2,.35,0.2), vec2(.1 * (cos(p1.z*.9)), .5)) );
    sdf = opUnion( sdf, hexPrismSDF(p1.zyx * vec3(0.2,.35,0.2), vec2(.1 * (cos(p1.x*.9)), .5)) );
    vec3 p2 = rotateY(p, -u_time * 0.1);
    sdf = opUnion( sdf, hexPrismSDF(p2 * vec3(0.2,.35,0.2), vec2(.1 * (cos(p2.z) * 0.8), .5)) );
    sdf = opUnion( sdf, hexPrismSDF(p2.zyx * vec3(0.2,.35,0.2), vec2(.1 * (cos(p2.x) * 0.8), .5)) );
    p2 = rotateY(p2, QTR_PI);
    sdf = opUnion( sdf, hexPrismSDF(p2 * vec3(0.2,.35,0.2), vec2(.1 * (cos(p2.z) * 0.8), .5)) );
    sdf = opUnion( sdf, hexPrismSDF(p2.zyx * vec3(0.2,.35,0.2), vec2(.1 * (cos(p2.x) * 0.8), .5)) );
    sdf = opSubtraction(  cylinderSDF(p, 0.5, 1.), sdf );
    sdf = opUnion(sdf, length(p) - .3 );
    return sdf;
}

float judgement (in vec3 p) {
    float sdf = 1.0;
    vec3 p1 = p;
    sdf = opUnion( sdf, ( raysSDF(p1.xz + 0.5, 25) * 2.0 - step(abs(p1.y), 0.05))  );
    sdf = opUnion( sdf, cubeSDF(p, 0.35));
    return sdf;
}

float world (in vec3 p) {
    float sdf = 1.0;
    sdf = opUnion( sdf, flowerSDF(p.xz + 0.5, 5) * .65 - .5  );

    float s = length(p);
    sdf = opIntersection( sdf, s - 1., 0.1);
    sdf = opSubtraction( s - .5, sdf );

    // sdf = opSubtraction(cylinderSDF(p, 0.5, 2.), sdf);

    // sdf = opIntersection( sdf, boxSDF(p, vec3(1.0, 0.2, 1.0)) , 0.1);
    // sdf = opSubtraction(cylinderSDF(p, 0.25, 2.), sdf);
    // // sdf = opSubtraction( s - .7, sdf );
    // sdf = opUnion( sdf, s - .2  );

    sdf = opUnion( sdf, ring(p, 0.2) );

    return sdf;
}

float fool (in vec3 p) {
    float sdf = 1.0;
    vec3 p1 = p;
    
    p.z = -p.z;
    sdf = spiralSDF(p.xz + 0.5,.13) - 0.5;
    
    float s = length(p);
    sdf = opIntersection( sdf, s - 1.25, 0.1);
    sdf = opUnion( sdf, ring(p * 0.9, 0.2, 2.) );

    return sdf;
}


Material raymarchMap( in vec3 pos ) {
    Material res;
    vec3 p = pos.xzy * 1.5;
    vec3 p2 = p;
    p = rotateZ(p, u_time * 0.25);
    p = mix(    p, p2,
                smoothstep(0.3, 0.4, fract((pos.y) * 0.1 - u_time * 0.01)) );
    res.sdf = CARD_FNC(p);
    return res;
}

vec3 raymarchNormal(in vec3 pos) {
    float e = 0.5773 * 0.0005;
    vec2 offset = vec2(1.0, -1.0) * e;
    return normalize(
        offset.xyy * raymarchMap(pos + offset.xyy).sdf +
        offset.yyx * raymarchMap(pos + offset.yyx).sdf +
        offset.yxy * raymarchMap(pos + offset.yxy).sdf +
        offset.xxx * raymarchMap(pos + offset.xxx).sdf );
}

void main(void) {
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec2 size = vec2(512.0);
    vec2 pixel = 1.0/size;
    vec2 st = gl_FragCoord.xy * pixel;
    vec2 uv = v_texcoord;
    st = decimate(st, size) + 0.5 * pixel;

    vec4  buff1 = texture2D(u_buffer2, uv);
    vec4  buff2 = texture2D(u_buffer3, uv);
    vec3  pos = buff1.xyz * 2.0 - 1.0;
    vec3  vel = buff2.xyz * 2.0 - 1.0;
    pos = u_frame < 1 ? random3(uv) * 2.0 - 1.0: pos;

    vec3  ray = normalize(vel);
    Material  res = raymarchMap(pos);
    vec3  nor = raymarchNormal(pos);
    vec3  ref = reflect(ray, nor);
    vec3  vie = normalize(u_camera);
    float fre = dot(nor, vie);

#if defined(BUFFER_0)
    pos += vel * 0.05;

    color.rgb = fract(pos * 0.5 + 0.5);
    color.a = saturate(fre * 0.5 + 0.5);

#elif defined(BUFFER_1)
    vel += curl( pos * 0.5 + u_time * 0.1);

    // float a = atan(pos.y, pos.x) + HALF_PI;
    // vec3 swr = vec3(cos(a), sin(a), 0.0);
    // vel += swr * 1.5;

    if (res.sdf < LIM)
        vel = ref * 0.25;
        
    vel *= 0.5;
        
    color.rgb = clamp(vel, -0.99, 0.99) * 0.5 + 0.5;
    color.a = res.sdf;

#elif defined(BUFFER_2)
    color = texture2D(u_buffer0, uv);

#elif defined(BUFFER_3)
    color = texture2D(u_buffer1, uv);

// #elif defined(POSTPROCESSING)
//     color.rgb = texture2D(u_scene, st).rgb;

//     // pixel = 1.0/u_resolution;
    
//     // st = gl_FragCoord.xy * pixel;
//     // uv = st;
//     // vec2 uv2 = ratio(uv, u_resolution);
//     // float sdf = circleSDF(uv2);


//     // vec3 chroma = chromaAB(u_scene, st, 0.1 + sdf * 0.5);
//     // color.rgb += chroma;
//     // // color.rgb = blendScreen(color.rgb, chroma);

//     // vec3 halo = chromaAB(u_scene, uv, .5);
//     // color.rgb += halo;
//     // // color.rgb = blendScreen(color.rgb, halo);

//     // // Ghost sampling
//     // vec2 st_flipped = scale(vec2(st.x, 1.0-st.y), 0.8);
//     // const vec2 center = vec2( 0.5 );
//     // vec2 centerToUV = center - st_flipped;
//     // vec2 v_ghost = centerToUV * 0.4;
//     // vec3 ghost = vec3(0.0);
//     // ghost = barrel( u_scene, st_flipped + v_ghost, .35 ).rgb;
//     // // ghost = chromaAB(u_scene, st_flipped + v_ghost, 0.5);
//     // ghost *= vec3(0.1725, 0.149, 0.4863);
//     // color.rgb = blendScreen(color.rgb, ghost.rgb );
//     // // color.rgb += ghost;

#else
    color = v_color;

#endif

    gl_FragColor = color;
}
