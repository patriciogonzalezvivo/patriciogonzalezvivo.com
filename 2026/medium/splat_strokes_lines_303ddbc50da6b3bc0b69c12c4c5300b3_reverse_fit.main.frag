#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_alignedTex;
uniform sampler2D   u_strokeIndicesTex;
uniform vec2        u_strokeIndicesTexResolution;

uniform sampler2D   u_doubleBuffer0;
uniform sampler2D   u_doubleBuffer1;

uniform sampler2D   u_scene;
uniform sampler2D   u_sceneNormal;
uniform sampler2D   u_pyramid0;

uniform sampler2D   u_cameraTex;
uniform sampler2D   u_cameraNextTex;
uniform float       u_cameraPct;
uniform vec3        u_cameraTrg;
uniform vec3        u_camera;
uniform float       u_cameraNearClip;
uniform float       u_cameraFarClip;

uniform vec2        u_resolution;
uniform float       u_time;

varying vec4        v_position;
varying vec4        v_color;
varying vec3        v_normal;
varying vec2        v_texcoord;
varying vec2        v_uv;
varying vec2        v_uvStep;

vec2 toGL(vec2 uv) {
    uv.y = 1.0 - uv.y;
    return fract(uv);
}

vec4 sampleImg(sampler2D tex, vec2 uv) { return texture2D(tex, toGL(uv)); }
vec4 sampleIndex(vec2 uv) {
    vec2 g = toGL(uv);
    if (u_strokeIndicesTexResolution.x > 0.5)
        g = (floor(g * u_strokeIndicesTexResolution) + 0.5) / u_strokeIndicesTexResolution;
    return texture2D(u_strokeIndicesTex, g);
}

bool sameMark(vec4 a, vec4 b) {
    if (a.a < 0.5 || b.a < 0.5) 
        return false;
    vec3 d = abs(a.rgb - b.rgb);
    return max(d.r, max(d.g, d.b)) <= 0.5 / 255.0;
}


#define CAMERA_NEAR_CLIP u_cameraNearClip
#define CAMERA_FAR_CLIP u_cameraFarClip

#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/math/saturate.glsl"
#include "lygia/math/decimate.glsl"

#include "lygia/space/ratio.glsl"
#include "lygia/space/scale.glsl"
#include "lygia/space/decimateNormal.glsl"
#include "lygia/space/linearizeDepth.glsl"

#include "lygia/generative/random.glsl"
#include "lygia/generative/curl.glsl"

// #define FBM_OCTAVES 9
#include "lygia/generative/fbm.glsl"

#include "lygia/color/space/srgb2rgb.glsl"
#include "lygia/color/luma.glsl"

#include "lygia/sample/clamp2edge.glsl"

#define LATTICEBOLTZMANN_BOUNDARY
#define LATTICEBOLTZMANN_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX, UV, u_resolution)* 2.0 - 1.0)
#include "lygia/simulate/latticeBoltzmann.glsl"
#define FLUIDSOLVER_FNC(T, S, P, V) latticeBoltzmann(T, S, P, V * 75.0)

#include "lygia/color/mixSpectral.glsl"
#define DISPLACE_FNC(A,B,C) mixSpectral(A,B,C)

#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX, UV, u_resolution)* 2.0 - 1.0)
// #define DISPLACE_FROM_CONDITION (sourceVal.a >= currVal.a)
// #define DISPLACE_FROM_AMOUNT (1.0/-sourceVel.b) * sourceVal.a
// #define DISPLACE_FROM_AMOUNT 0.5 * sourceVel.w
// #define DISPLACE_FROM_AMOUNT  (sourceVel.w) * sourceVal.a 
// #define DISPLACE_FROM_AMOUNT 0.5 * sourceVal.a
// #define DISPLACE_TO_AMOUNT length(vel.xy) 
// #define DISPLACE_TO_AMOUNT 1.0-(currVel.w * 0.5 + 0.5)

#define DISPLACE_DIRECTIONS 16
#include "lygia/distort/displace.glsl"

#define PAINT_DECAY .99
#define FLUID_EXTEND_RADIUS 1


void main(void) {
    vec4 color = vec4(0.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;
    float t = u_time * 0.25;

#if defined(DOUBLE_BUFFER_0)
    vec2 uv = ratio(st, u_resolution);
    vec2 q = vec2(0.0);

    float scale = 2.0;
    q.x = fbm( uv * (scale + 2.0) - 0.2 * t);
    q.y = fbm( uv * (scale + 3.0) + 0.23 * t);

    vec2 r = vec2(0.);
    r.x = fbm( uv * 4.0 + 2.0 * q + vec2(1.7,9.2) + 0.15 * t );
    r.y = fbm( uv * 6.0 - 2.0 * q + vec2(8.3,2.8) + 0.126 * t);

    vec2 v = r * length(q);

    vec3 normal = texture2D(u_pyramid0, st).rgb * 2.0 - 1.0;
    float amount = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));

    v = mix(v * 2.0, normal.xy , amount);

    color  = FLUIDSOLVER_FNC(u_doubleBuffer0, st, pixel, v);

    color.xy *= 0.99;
    color.xy = saturate(color.xy * 0.5 + 0.5);
    color.z = saturate(color.z);
    color.w = 1.0;

#elif defined(DOUBLE_BUFFER_1)
    vec4 tex = sampleClamp2edge(u_scene, st, u_resolution);
    color = displace(u_doubleBuffer0, u_doubleBuffer1, st, pixel);
    color = mix(color, tex, tex.a);
    color.a *= 0.99;
    // color.rgb = mix(tex.rgb, color.rgb, color.a);
    // color.a = max(color.r, max(color.g, color.b));
    // color.a = 1.0;

#elif defined(MODEL_PRIMITIVE_GSPLATS)
    #if !defined(SCENE_BUFFER_NORMAL)
        discard;
    #endif

    vec2 uv = v_uv;
    vec2 uvStep = v_uvStep;
    vec2 uvFrag = uv + vec2(-uvStep.x, uvStep.y);

    vec4 idSelf = sampleIndex(uv);
    vec4 idFrag = sampleIndex(uvFrag);
    if (idSelf.a >= .5 && !sameMark(idSelf, idFrag))
        discard;

    color.rgb = sampleImg(u_alignedTex, uvFrag).rgb;

    #if defined(SCENE_BUFFER_NORMAL)
    vec3 normal = v_normal;
    // normal = decimateNormal(normal, 8.);
    color.rgb = normal * 0.5 + 0.5;
    color.a = 1.0;
    #endif


#elif defined(PYRAMID_0)
    color = texture2D(u_sceneNormal, st);

#elif defined(POSTPROCESSING)
    color = vec4(1.0);
    vec4 fluid = texture2D(u_doubleBuffer1, st);
    color = mix(color, fluid, fluid.a);

    vec4 scene = texture2D(u_scene, st);
    color = mix(color, scene * 0.5, scene.a);

    // float pct = clamp(pow(length(u_cameraTrg - u_camera), .2), 0.0, 1.0);
    // color = mix(texture2D(u_alignedTex, fract(st)), color, pct);

#else

    color = v_color;
#endif

    gl_FragColor = color;
}
