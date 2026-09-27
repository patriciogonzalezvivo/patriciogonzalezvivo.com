#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_alignedTex;
uniform sampler2D   u_strokeIndicesTex;
uniform vec2        u_strokeIndicesTexResolution;

uniform sampler2D   u_doubleBuffer0; // 0.1
uniform sampler2D   u_doubleBuffer1;

uniform sampler2D   u_scene;

uniform vec3        u_camera;
uniform vec3        u_cameraTrg;
uniform float       u_cameraPct;
uniform float       u_cameraNearClip;
uniform float       u_cameraFarClip;

uniform vec2        u_resolution;
uniform float       u_time;
uniform int         u_frame;
uniform int         u_change;

varying vec4        v_position;
varying vec4        v_color;
varying vec3        v_normal;
varying vec2        v_texcoord;
varying vec2        v_uv;
varying vec2        v_uvStep;

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

#define CAMERA_NEAR_CLIP u_cameraNearClip
#define CAMERA_FAR_CLIP u_cameraFarClip

#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/math/saturate.glsl"

#include "lygia/space/ratio.glsl"

#include "lygia/generative/random.glsl"

// #define FBM_OCTAVES 9
#include "lygia/generative/fbm.glsl"

#include "lygia/color/luma.glsl"

#include "lygia/sample/clamp2edge.glsl"

#define LATTICEBOLTZMANN_BOUNDARY
#define LATTICEBOLTZMANN_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX, UV, u_resolution)* 2.0 - 1.0)
#include "lygia/simulate/latticeBoltzmann.glsl"
#define FLUIDSOLVER_FNC(T, S, P, V) latticeBoltzmann(T, S, P, V * 75.0)

// #include "lygia/color/mixSpectral.glsl"
// #define DISPLACE_FNC(A,B,C) mixSpectral(A,B,C)

#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX, UV, u_resolution)* 2.0 - 1.0)
#define DISPLACE_FROM_CONDITION (sourceVal.a >= currVal.a)
// #define DISPLACE_FROM_AMOUNT (1.0/-sourceVel.b) * sourceVal.a
// #define DISPLACE_FROM_AMOUNT 0.5 * sourceVel.w
// #define DISPLACE_FROM_AMOUNT  (sourceVel.w) * sourceVal.a 
// #define DISPLACE_FROM_AMOUNT 0.5 * sourceVal.a
// #define DISPLACE_TO_AMOUNT length(vel.xy) 
// #define DISPLACE_TO_AMOUNT 1.0-(currVel.w * 0.5 + 0.5)

#define DISPLACE_DIRECTIONS 16
#include "lygia/distort/displace.glsl"

void main(void) {
    vec4 color = vec4(vec3(0.0), 1.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;
    float t = u_time * 0.25;

    float pct1 = pow(1.0-st.y, 0.2);

#if defined(DOUBLE_BUFFER_0)
    vec2 uv = ratio(st, u_resolution);

    vec2 q = vec2(0.0);
    q.x = fbm( uv * 2.0 - 0.2 * t);
    q.y = fbm( uv * 3.0 + 0.23 * t);

    vec2 r = vec2(0.);
    r.x = fbm( uv * 4.0 + 2.0 * q + vec2(1.7,9.2) + 0.15 * t );
    r.y = fbm( uv * 6.0 - 2.0 * q + vec2(8.3,2.8) + 0.126 * t);

    vec2 v = r * length(q);
    color  = FLUIDSOLVER_FNC(u_doubleBuffer0, st, pixel, v);

    color.xy *= pct1;
    color.xy = saturate(color.xy * 0.5 + 0.5);
    color.z = saturate(color.z);
    color.w = 1.0;

#elif defined(DOUBLE_BUFFER_1)
    vec4 tex = sampleClamp2edge(u_scene, st, u_resolution);
    vec4 prevPaint = displace(u_doubleBuffer0, u_doubleBuffer1, st, pixel);

    color.rgb = mix(prevPaint.rgb * (0.99 + pct1 * 0.01), tex.rgb, tex.a);
    color.rgb = mix(tex.rgb, color.rgb, color.a);
    color.a = max(color.r, max(color.g, color.b));

#elif defined(POSTPROCESSING)
    vec4 paint = texture2D(u_doubleBuffer1, st);
    color.rgb = mix(color.rgb, paint.rgb, paint.a);
    color.a = 1.0;

    // color = texture2D(u_scene, st);

#elif defined(MODEL_PRIMITIVE_GSPLATS)
    vec2 uvFrag = v_uv + vec2(-v_uvStep.x, v_uvStep.y);
    vec2 uvSplat = v_texcoord.xy ;

    vec4 idSelf = sampleIndex(v_uv);
    vec4 idFrag = sampleIndex(uvFrag);
    // unpack index color into an index float
    float index = (idSelf.r * 255.0 * 255.0 + idSelf.g * 255.0 + idSelf.b * 255.0) / (255.0 * 255.0);

    if (idSelf.a >= .5 && !sameMark(idSelf, idFrag))
        discard;

    vec4 tex = sampleImg(u_alignedTex, uvFrag);
    float l = pow(luma(tex.rgb), 10.);
    color.rgb = tex.rgb;

#else

    color = v_color;

#endif

    gl_FragColor = color;
}
