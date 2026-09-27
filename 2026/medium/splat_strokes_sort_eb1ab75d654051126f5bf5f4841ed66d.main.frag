#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_buffer0;

uniform sampler2D   u_scene;

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

#define ERROR 3.0
#define PIXEL_SIZE 2.0
#define MAX_STEPS 9999.0

#include "lygia/math/const.glsl"
#include "lygia/math/mirror.glsl"
#include "lygia/color/luma.glsl"
#include "lygia/space/decimateNormal.glsl"

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


vec2 sortUV(sampler2D tex, vec2 uv, vec2 dir, float threshold) {
    float g = luma(texture2D(tex, uv).rgb); 

    if (g < threshold)
        return uv; 
    
    float rank = 0.;
    vec2 headPos = vec2(0.0);
    // Search thr first pixel under the threshold
    // to the left (when angle = 0)
    for (float i = 0.; i < MAX_STEPS; i += 1.) {
        vec2 uv2 = uv - dir * i;
        
        if (uv2.x < 0. || uv2.y < 0. || uv2.x >= 1. || uv2.y >= 1.) {
            headPos = uv2;
            break;
        }
   
        float gi = luma(texture2D(tex, uv2).rgb);
        if (gi < threshold) {
            headPos = uv2;
            break;
        } 
        
        rank += step(gi, g);
    }

    // Search thr first pixel under the threshold
    // to the right (when angle = 0)
    for (float i = 0.; i < MAX_STEPS; i += 1.) {
        vec2 uv2 = uv + dir * i;

        if (uv2.x < 0. || uv2.y < 0. || uv2.x >= 1. || uv2.y >= 1.)
            break;

        float gi = luma(texture2D(tex, uv2).rgb);
        if (gi <= threshold)
            break;

        rank += step(gi + 0.00001, g);
    }

    // where this pixel should be rendered    
    return headPos + rank * dir;;
}

vec4 sampleUVMap(sampler2D tex0, sampler2D tex1, vec2 uv, vec2 dir, vec2 pixel) {
    vec3 col = texture2D(tex1, uv).rgb;
    //return vec4(col.x, col.y, 1, 1);

    // Tolerance derived from the actual step size (dir), not a fixed axis of
    // `pixel` -- dir already bakes in both PIXEL_SIZE and the search angle,
    // so this stays correct regardless of block size or non-cardinal angles,
    // where pixel.x alone would be the wrong axis (or the wrong magnitude
    // once PIXEL_SIZE != 1).
    float pixelSize = ERROR * pixel.x; // allow errors

    vec2 uv2 = vec2(0.0);
    vec2 uv3 = vec2(0.0);
    for (float i = 0.; i < MAX_STEPS; i++) {
        {
            uv2 = uv - dir * i;
            uv3 = texture2D(tex1, uv2).xy; // destination of pixel at uv2
            if (length(uv - uv3) < pixelSize)
                return texture2D(tex0, uv2);
        }
        {
            uv2 = uv + dir * i;
            uv3 = texture2D(tex1, uv2).xy; // destination of pixel at uv2
            if (length(uv - uv3) < pixelSize)
                return texture2D(tex0, uv2);
        }
    }        
    
    return texture2D(tex0, col.xy);
}

void main(void) {
    vec4 color = vec4(vec3(0.0), 1.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;
    float amount = .5;

    float angle = 0.0;//PI * 0.5;
    vec2 dir = vec2(cos(angle), sin(angle)) * pixel * PIXEL_SIZE;
    amount = 0.1 + mirror(u_time * 0.25) * 0.5;

#if defined(BUFFER_0)
    // amount = texture2D(u_scene, st).a * 0.0001;
    color.xy = sortUV(u_scene, st, dir, amount);

#elif defined(POSTPROCESSING)
    vec4 sorted = sampleUVMap(u_scene, u_buffer0, st, dir, pixel);
    sorted.a = 1.0;
    color = texture2D(u_scene, st);
    color = mix(sorted, color, color.a);
    color = sorted;

#elif defined(MODEL_PRIMITIVE_GSPLATS)
    vec2 uv = v_uv; // this mark's centroid uv (y down)
    vec2 uvStep = v_uvStep; // this fragment's offset from the centroid (y down)
    vec2 uvFrag = uv + vec2(-uvStep.x, uvStep.y); // this fragment's uv (y down)

    vec4 idSelf = sampleIndex(uv);
    vec4 idFrag = sampleIndex(uvFrag);
    if (idSelf.a >= .5 && !sameMark(idSelf, idFrag))
        discard;                            // fragment left this mark's region

    color.rgb = sampleImg(u_alignedTex, uvFrag).rgb;

#else
    color = v_color;
#endif

    gl_FragColor = color;
}
