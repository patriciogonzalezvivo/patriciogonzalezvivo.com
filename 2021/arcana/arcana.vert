#ifdef GL_ES
precision highp float;
#endif

// Copyright Patricio Gonzalez Vivo, 2021 - http://patriciogonzalezvivo.com/
// I am the sole copyright owner of this Work.
//
// You cannot host, display, distribute or share this Work in any form,
// including physical and digital. You cannot use this Work in any
// commercial or non-commercial product, website or project. You cannot
// sell this Work and you cannot mint an NFTs of it.
// I share this Work for educational purposes, and you can link to it,
// through an URL, proper attribution and unmodified screenshot, as part
// of your educational material. If these conditions are too restrictive
// please contact me and we'll definitely work it out.

uniform sampler2D   u_buffer2;  // 512x512
uniform sampler2D   u_buffer3;  // 512x512 

uniform mat4        u_modelMatrix;
uniform mat4        u_viewMatrix;
uniform mat4        u_projectionMatrix;
uniform mat4        u_modelViewProjectionMatrix;
uniform vec3        u_camera;
uniform vec2        u_resolution;
uniform float       u_time;

attribute vec4      a_position;
varying vec4        v_position;

varying vec4        v_color;
attribute vec2      a_texcoord;
varying vec2        v_texcoord;

#include "lygia/math/const.glsl"
#include "lygia/math/powFast.glsl"
#include "lygia/math/saturate.glsl"
#include "lygia/math/decimate.glsl"

vec3 irri(float x) {
    vec3 color = vec3(0.);
    // color = spectrum(x);
    // color = chroma(x);
    color = mix(color, vec3(1.0), powFast(color.g, 6.));
    return  color;
}

void main(void) {
    v_position = a_position;
    v_texcoord = a_position.xy;
    vec2 size = vec2(512.0);//u_resolution;
    vec2 pixel = 1.0/size;

    vec2 uv = v_texcoord;
    uv = decimate(uv, size) + 0.5 * pixel;

    vec4 buff2 = texture2D(u_buffer2, uv);
    vec4 buff3 = texture2D(u_buffer3, uv);
    
    vec3 pos = buff2.xyz * 2.0 - 1.0;
    v_position.xyz = pos * 3.0;

    // vec3 vel = buff3.xyz * 2.0 - 1.0;
    float fre = buff2.a * 2.0 - 1.0;
    float sdf = step(buff3.a, 0.001);
    float spe = sin(fre * PI) * 0.5 + 0.5;
    float rnd = a_position.z;
    v_color = vec4(vec3(.9), .5);
    v_color = mix(
                    vec4(irri(spe), 0.99),
                    v_color,
                    abs(fre) );
    v_color.a = 0.1 + v_color.a * sdf;

    float dist = length(pos - u_camera);
    gl_PointSize = mix(1.0, 10.0, powFast(1.0 - saturate(dist / 5.0), 3.0));
    
    gl_Position = u_projectionMatrix * u_viewMatrix * v_position;
}
