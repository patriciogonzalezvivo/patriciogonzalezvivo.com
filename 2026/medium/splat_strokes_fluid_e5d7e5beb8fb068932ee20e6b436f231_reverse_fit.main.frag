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
uniform vec3        u_camera;
uniform vec3        u_cameraTrg;
uniform float       u_cameraPct;
uniform float       u_cameraNearClip;
uniform float       u_cameraFarClip;
uniform float       u_cameraDistance;

uniform vec2        u_resolution;
uniform float       u_time;
uniform int         u_frame;
uniform int         u_change;

varying vec4        v_position;
varying vec4        v_color;      // only meaningful for the plain-mesh fallback below
varying vec3        v_normal;     // only meaningful for the plain-mesh fallback below
varying vec2        v_texcoord;
varying vec2        v_uv;
varying vec2        v_uvStep;

#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"

#include "lygia/space/ratio.glsl"

#define FBM_OCTAVES 8
#include "lygia/generative/fbm.glsl"

// #define LATTICEBOLTZMANN_BOUNDARY
#define LATTICEBOLTZMANN_SAMPLER_FNC(TEX, UV) (SAMPLER_FNC(TEX, UV)* 2.0 - 1.0)
#include "lygia/simulate/latticeBoltzmann.glsl"
#define FLUIDSOLVER_FNC(T, S, P, V) latticeBoltzmann(T, S, P, V * 75.0)

// #include "lygia/color/mixSpectral.glsl"
// #define DISPLACE_FNC(A,B,C) mixSpectral(A,B,C)

#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) (SAMPLER_FNC(TEX, UV)* 2.0 - 1.0)
#define DISPLACE_FROM_CONDITION (sourceVal.a >= currVal.a)
// #define DISPLACE_FROM_AMOUNT (1.0/-sourceVel.b) * sourceVal.a
// #define DISPLACE_FROM_AMOUNT 0.5 * sourceVel.w
// #define DISPLACE_FROM_AMOUNT  (sourceVel.w) * sourceVal.a 
// #define DISPLACE_FROM_AMOUNT 0.5 * sourceVal.a
// #define DISPLACE_TO_AMOUNT length(vel.xy) 
#define DISPLACE_TO_AMOUNT 1.0-(currVel.w * 0.5 + 0.5)

// #define DISPLACE_DIRECTIONS 16
#include "lygia/distort/displace.glsl"

vec2 toGL(vec2 uv) { uv.y = 1.0 - uv.y; return uv; }
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

void main(void) {
    vec4 color = vec4(vec3(0.0), 1.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;

#if defined(DOUBLE_BUFFER_0)
    vec2 uv = ratio(st, u_resolution);
    vec2 q = vec2(0.0);
    q.x = fbm( uv + 0.01 * u_time);
    q.y = fbm( uv + 0.013 * u_time);

    vec2 r = vec2(0.);
    r.x = fbm( uv * 2.0 + 2.0 * q + vec2(1.7,9.2) + 0.15 * u_time );
    r.y = fbm( uv * 2.0 + 2.0 * q + vec2(8.3,2.8) + 0.126 * u_time);

    vec2 v = r * length(q);

    vec3 normal = texture2D(u_pyramid0, st + v).rgb * 2.0 - 1.0;
    float amount = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
    v += normal.xy * pixel * amount + q;

    color = FLUIDSOLVER_FNC(u_doubleBuffer0, st, pixel, v);

    color.xy *= 0.99;
    color.xy = saturate(color.xy * 0.5 + 0.5);
    color.z = saturate(color.z);
    color.w = 1.0;

#elif defined(DOUBLE_BUFFER_1)
    float alpha = texture2D(u_scene, st).a;
    color = displace(u_doubleBuffer0, u_doubleBuffer1, st, pixel);

    vec4 tex = texture2D(u_scene, st);
    color = mix( color, tex, alpha );

    color.rgb *= 0.998;

    // float pct = clamp(pow(length(u_cameraTrg - u_camera)*10., 1.), 0.0, 1.0);
    // color = mix(texture2D(u_alignedTex, st), color, pct);

#elif defined(POSTPROCESSING)
    color = texture2D(u_doubleBuffer1, st);

#elif defined(MODEL_PRIMITIVE_GSPLATS)
    vec2 uvFrag = v_uv + vec2(-v_uvStep.x, v_uvStep.y);

    vec4 idSelf = sampleIndex(v_uv);
    vec4 idFrag = sampleIndex(uvFrag);
    if (idSelf.a >= .5 && !sameMark(idSelf, idFrag))
        discard;

    color.rgb = sampleImg(u_alignedTex, uvFrag).rgb;

    #if defined(SCENE_BUFFER_NORMAL)
    vec3 normal = v_normal;
    color.rgb = normal * 0.5 + 0.5;
    #endif

#elif defined(PYRAMID_0)
    color = texture2D(u_sceneNormal, st);

#else
    color = v_color;
#endif

    gl_FragColor = color;
}
