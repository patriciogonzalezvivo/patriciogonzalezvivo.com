#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_alignedTex;
uniform sampler2D   u_strokeIndicesTex;
uniform vec2        u_strokeIndicesTexResolution;

uniform sampler2D   u_scene;
uniform sampler2D   u_sceneNormal;
uniform sampler2D   u_doubleBuffer0;

uniform sampler2D   u_cameraTex;
uniform sampler2D   u_cameraNextTex;
uniform float       u_cameraPct;
uniform vec3        u_cameraTrg;
uniform vec3        u_camera;

uniform vec2        u_resolution;
uniform float       u_time;

uniform vec3        u_light;
uniform vec3        u_lightColor;
uniform float       u_lightFalloff;
uniform float       u_lightIntensity;
uniform float       u_iblLuminance;
uniform samplerCube u_cubeMap;
uniform vec3        u_SH[9];

varying vec4        v_position;
varying vec4        v_color;
varying vec3        v_normal;
varying vec2        v_texcoord;
varying vec2        v_uv;
varying vec2        v_uvStep;

#define SURFACE_POSITION    v_position
#define CAMERA_POSITION     u_camera
#define IBL_LUMINANCE       u_iblLuminance
#define LIGHT_DIRECTION     u_light
#define LIGHT_COLOR         u_lightColor
#define LIGHT_FALLOFF       u_lightFalloff
#define LIGHT_INTENSITY     u_lightIntensity

#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/math/saturate.glsl"
#include "lygia/math/decimate.glsl"
#include "lygia/color/luma.glsl"
#include "lygia/color/palette/hue.glsl"
#include "lygia/space/decimateNormal.glsl"

#include "lygia/sample/clamp2edge.glsl"
#define GAUSSIANBLUR2D_SAMPLER_FNC(TEX, UV) sampleClamp2edge(TEX, UV)
#include "lygia/filter/gaussianBlur/2D.glsl"

#define ARROWS_TILE_SIZE 64.0
#define ARROWS_STYLE_LINE_TRIANGLE
#define ARROWS_SHAFT_THICKNESS 2.0
#define ARROWS_HEAD_LENGTH ARROWS_TILE_SIZE/4.0
#include "lygia/draw/arrows.glsl"

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

void main(void) {
    vec4 color = vec4(vec3(0.0), 1.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;

#if defined(DOUBLE_BUFFER_0)
    vec3 normal = gaussianBlur2D(u_sceneNormal, st, pixel * 3., 9).rgb * 2.0 - 1.0;
    // float depth = linearizeDepth(texture2D(u_sceneDepth, st).x);
    float amount = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
    vec2 dir = normal.xy * pixel * 10.0 * amount;

    // color.rgb = gaussianBlur2D(u_doubleBuffer0, st, pixel * 2., 6).rgb * 0.8;
    color.rg += saturate(dir * 0.5 + 0.5);

#elif defined(POSTPROCESSING)
    float l = luma(texture2D(u_scene, st));
    vec3 normal = texture2D(u_sceneNormal, st).rgb * 2.0 - 1.0;
    color.rgb += pow(dot(normalize(normal), normalize(vec3(cos(u_time * 0.8), 0.5 + sin(u_time * 0.3) * 0.25, 0.1))) * 0.5 + 0.5, 1.8);
    color.rgb *= l;

    vec2 arrowResolution = u_resolution;

    // sample velocity from buffer0 and scale it for arrow visualization
    vec2 st2 = arrowsTileCenterCoord(gl_FragCoord.xy) * pixel;
    vec3 velData = texture2D(u_doubleBuffer0, st2).xyx;
    vec2 vel = (velData.xy * 2.0 - 1.0);
    // vel *= 20.;
    vec3 velColor = hue(atan(vel.y, vel.x) / TAU);
    color += saturate( arrows(st, vel, u_resolution) * vec4(velColor, 1.0) * (1.0-length(vel) * 40.));

#elif defined(MODEL_PRIMITIVE_GSPLATS)
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
    normal = decimateNormal(normal, 8.);
    color.rgb = normal * 0.5 + 0.5;
    #endif
#else

    color = v_color;
#endif

    gl_FragColor = color;
}
