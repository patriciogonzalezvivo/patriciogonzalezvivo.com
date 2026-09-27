#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_alignedTex;
uniform sampler2D   u_strokeIndicesTex;
uniform vec2        u_strokeIndicesTexResolution;

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

#include "lygia/lighting/material/new.glsl"
#include "lygia/lighting/pbr.glsl"
#include "lygia/color/space/linear2gamma.glsl"

vec2 toGL(vec2 uv) {
    uv.y = 1.0 - uv.y;
    return uv;
}

vec4 sampleImg(sampler2D tex, vec2 uv) { return texture2D(tex, toGL(uv)); }
vec4 sampleIndex(vec2 uv) {
    vec2 g = toGL(uv);
    if (u_strokeIndicesTexResolution.x > 0.5)
        g = (floor(g * u_strokeIndicesTexResolution) + 0.5) / u_strokeIndicesTexResolution;
    return texture2D(u_strokeIndicesTex, g);
}

bool sameMark(vec4 a, vec4 b) {
    if (a.a < 0.5 || b.a < 0.5) return false;      // one side is background
    vec3 d = abs(a.rgb - b.rgb);
    return max(d.r, max(d.g, d.b)) <= 0.5 / 255.0;
}

void main(void) {
    vec4 color = vec4(vec3(0.0), 1.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;

#if defined(MODEL_PRIMITIVE_GSPLATS)
    vec2 uv = v_uv; // this mark's centroid uv (y down)
    vec2 uvStep = v_uvStep; // this fragment's offset from the centroid (y down)
    vec2 uvFrag = uv + vec2(-uvStep.x, uvStep.y); // this fragment's uv (y down)

    vec4 idSelf = sampleIndex(uv);
    vec4 idFrag = sampleIndex(uvFrag);
    if (idSelf.a >= .5 && !sameMark(idSelf, idFrag))
        discard;
    color.rgb = sampleImg(u_alignedTex, uvFrag).rgb;

#elif defined(MODEL_PRIMITIVE_POINTS)
    color = v_color;

#elif defined(BACKGROUND)
    color = vec4(1.0);

#else
    color = vec4(0.0, 0.0, 1.0, 1.0);
    
#endif

    gl_FragColor = color;

}
