#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_scene;

uniform sampler2D   u_alignedTex;

uniform float       u_cameraPct;
uniform vec3        u_cameraTrg;
uniform vec3        u_camera;

uniform vec2        u_resolution;
uniform float       u_time;

varying vec4        v_position;
varying vec4        v_color;
varying vec3        v_normal;
varying vec2        v_texcoord;
varying vec2        v_uv;
varying vec2        v_uvStep;     

#include "lygia/math/const.glsl"
#include "lygia/math/mirror.glsl"
#include "lygia/math/saturate.glsl"

#include "lygia/space/ratio.glsl"
#include "lygia/space/scale.glsl"
#include "lygia/color/luma.glsl"
#include "lygia/color/desaturate.glsl"
#include "lygia/color/blend/add.glsl"
#include "lygia/color/blend/screen.glsl"

#include "lygia/color/space/linear2gamma.glsl"
#include "lygia/color/space/gamma2linear.glsl"

#include "lygia/generative/random.glsl"

#include "lygia/sdf/circleSDF.glsl"
#include "lygia/draw/stroke.glsl"

vec2 toGL(vec2 uv) {
    uv.y = 1.0 - uv.y;
    return uv;
}

vec4 sampleImg(sampler2D tex, vec2 uv) { return texture2D(tex, toGL(uv)); }

bool sameMark(vec4 a, vec4 b) {
    if (a.a < 0.5 || b.a < 0.5) return false;      // one side is background
    vec3 d = abs(a.rgb - b.rgb);
    return max(d.r, max(d.g, d.b)) <= 0.5 / 255.0;
}

#define BARREL_TYPE vec3
#define BARREL_SAMPLER_FNC(TEX, UV) texture2D(TEX, UV).rgb
#define BARREL_DISTANCE -(dist*dist)
#include "lygia/distort/barrel.glsl"

// #define CHROMAAB_TYPE vec3
// #define CHROMAAB_CENTER_BUFFER .18
// #define CHROMAAB_CENTER_BUFFER .9
#define CHROMAAB_SAMPLER_FNC(TEX, UV) barrel(TEX, UV, 0.1-offset.x)
#include "lygia/distort/chromaAB.glsl"

#define STRETCH_TYPE vec3
#define STRETCH_SAMPLER_FNC(TEX, UV) gamma2linear( chromaAB(TEX, toGL(UV), vec2(1.5*length(UV)-1.), 1.5 ) )
#include "lygia/distort/stretch.glsl"

void main(void) {
    vec4 color = vec4(vec3(0.0), 1.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;

#if defined(POSTPROCESSING)
    color = texture2D(u_scene, st);

    vec2 st2 = ratio(st, u_resolution);
    float sdf = circleSDF(st2);

    vec3 chroma = chromaAB(u_scene, st, sdf * 0.25).rgb ;
    chroma = pow(chroma, vec3(2.2)) * 0.5;
    color.rgb = blendScreen(color.rgb, chroma);

    color = linear2gamma(color);

// #elif defined(BACKGROUND)
//     float pct = clamp(pow(length(u_cameraTrg - u_camera), 1.), 0.0, 1.0);
//     color = mix(texture2D(u_alignedTex, st), vec4(0.0), pct);

#elif defined(MODEL_PRIMITIVE_GSPLATS)
    vec2 uv = v_uv;
    vec2 uvStep = v_uvStep;
    vec2 uvFrag = uv + vec2(-uvStep.x, uvStep.y);

    float index = random(uv);
    color.rgb = sampleImg(u_alignedTex, uvFrag).rgb;
    color = gamma2linear(color);

    float amount = 1.0;
    vec2 dir = vec2(pixel.x, 0.0);
    vec2 st2 = (vec2(2.0) + v_texcoord) * 0.25;

    vec2 translation = vec2(fract(u_time * fract(0.1 + index) + index * 10.0), 0.0);

    float head = stroke(st2.x, translation.x, 0.5, 0.25);
    // head += stroke(st2.x, translation.x, 0.25, 0.1) * 0.5;

    vec3 stretched = stretch(u_alignedTex, uvFrag, dir * 10.0 * pixel); 
    // stretched += stretch(u_alignedTex, uvFrag, dir * -10.0 * pixel);
    color.rgb = blendScreen(color.rgb, stretched * 3.0 * amount, head);

#else
    color = v_color;
#endif

    gl_FragColor = color;

    // #endif
}
