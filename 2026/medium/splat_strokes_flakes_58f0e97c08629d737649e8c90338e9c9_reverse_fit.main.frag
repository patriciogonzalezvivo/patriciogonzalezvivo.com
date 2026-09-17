#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_alignedTex;
uniform sampler2D   u_strokeIndicesTex;
uniform vec2        u_strokeIndicesTexResolution;

uniform sampler2D   u_scene;
uniform sampler2D   u_sceneDepth;

uniform sampler2D   u_imageTex;

uniform float       u_cameraPct;
uniform vec3        u_cameraTrg;
uniform vec3        u_camera;
uniform vec2        u_mouse;

uniform vec2        u_resolution;
uniform float       u_time;

varying vec4        v_position;
varying vec4        v_color;
varying vec3        v_normal;
varying vec2        v_texcoord;
varying vec2        v_uv;
varying vec2        v_uvStep;
varying float       v_pct;

#define RESOLUTION u_resolution


#include "lygia/space/ratio.glsl"
#include "lygia/generative/snoise.glsl"
#include "lygia/sample/clamp2edge.glsl"
#include "lygia/sample/zero.glsl"

#define CIRCLESDF_FNC(UV) (dot(UV, UV))
#include "lygia/sdf/circleSDF.glsl"
#define CHROMAAB_SAMPLER_FNC(TEX, UV) sampleClamp2edge(TEX, UV)
#include "lygia/distort/chromaAB.glsl"

// #define BARREL_OCT_1
#define BARREL_OCT_2
#define BARREL_SAMPLER_FNC(TEX, UV) chromaAB(TEX, UV, dot(UV-.5, UV-.5) * 4.0)
#include "lygia/distort/barrel.glsl"

#define SAMPLEDOF_COLOR_SAMPLE_FNC(TEX, UV) barrel(TEX, UV)

// #define SAMPLEDOF_DEBUG
#define SAMPLEDOF_BLUR_SIZE 2.
#include "lygia/sample/dof.glsl"

vec2 toGL(vec2 uv) { uv.y = 1.0 - uv.y; return fract(uv); }
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

vec3 lensflare(vec2 uv, vec2 pos, float oclussion) {
    vec2 main = uv-pos;
    vec2 uvd = uv*(length(uv));
        
    float ang = atan(main.x,main.y);
    float dist=length(main); dist = pow(dist,.1);
    float n = snoise(vec2(ang*16.0,dist*32.0));
        
    float f0 = 1.0/(length(uv-pos)*16.0+1.0);
        
    //f0 = f0 + f0*(sin(noise(sin(ang*2.+pos.x)*4.0 - cos(ang*3.+pos.y))*16.)*.1 + dist*.1 + .8);
        
    float f1 = max(0.01-pow(length(uv+1.2*pos),1.9),.0)*7.0;
    float f2 = max(1.0/(1.0+32.0*pow(length(uvd+0.8*pos),2.0)),.0)*00.25;
    float f22 = max(1.0/(1.0+32.0*pow(length(uvd+0.85*pos),2.0)),.0)*00.23;
    float f23 = max(1.0/(1.0+32.0*pow(length(uvd+0.9*pos),2.0)),.0)*00.21;
    
    vec2 uvx = mix(uv,uvd,-0.5);
        
    float f4 = max(0.01-pow(length(uvx+0.4*pos),2.4),.0)*6.0;
    float f42 = max(0.01-pow(length(uvx+0.45*pos),2.4),.0)*5.0;
    float f43 = max(0.01-pow(length(uvx+0.5*pos),2.4),.0)*3.0;
        
    uvx = mix(uv,uvd,-.4);
        
    float f5 = max(0.01-pow(length(uvx+0.2*pos),5.5),.0)*2.0;
    float f52 = max(0.01-pow(length(uvx+0.4*pos),5.5),.0)*2.0;
    float f53 = max(0.01-pow(length(uvx+0.6*pos),5.5),.0)*2.0;
        
    uvx = mix(uv,uvd,-0.5);
        
    float f6 = max(0.01-pow(length(uvx-0.3*pos),1.6),.0)*6.0;
    float f62 = max(0.01-pow(length(uvx-0.325*pos),1.6),.0)*3.0;
    float f63 = max(0.01-pow(length(uvx-0.35*pos),1.6),.0)*5.0;
        
    vec3 c = vec3(.0);

    f0 *= oclussion;
    f1 *= oclussion;
    f2 *= oclussion;
    f22 *= oclussion;
    f23 *= oclussion;
    f4 *= oclussion;
        
    c.r+=f2+f4+f5+f6; 
    c.g+=f22+f42+f52+f62; 
    c.b+=f23+f43+f53+f63;
    c = c*1.3 - vec3(length(uvd)*.05);
    c+=vec3(f0);
        
    return c;
}

void main(void) {
    vec4 color = vec4(vec3(0.0), 1.0);
    vec2 pixel = 1.0/u_resolution.xy;
    vec2 st = gl_FragCoord.xy * pixel;
    float pct = 0.5 + 0.5 * sin(u_time * 0.5);
    pct = 1.0-pct;

#if defined(MODEL_PRIMITIVE_GSPLATS)
    vec2 uv = v_uv; // this mark's centroid uv (y down)
    vec2 uvStep = v_uvStep; // this fragment's offset from the centroid (y down)
    vec2 uvFrag = uv + vec2(-uvStep.x, uvStep.y); // this fragment's uv (y down)

    vec4 idSelf = sampleIndex(uv);
    vec4 idFrag = sampleIndex(uvFrag);

    if (idSelf.a >= .5 && !sameMark(idSelf, idFrag))// && v_pct <= 0.5)
        discard;

    color.rgb = mix(
        sampleImg(u_alignedTex, uvFrag).rgb,
        sampleImg(u_imageTex, uvFrag).rgb,
        v_pct
    );

#elif defined(POSTPROCESSING)
    vec4 sceneColor = texture2D(u_scene, st);
    color.rgb = barrel(u_scene, st);

    vec2 uv = ratio(st, u_resolution);
    vec2 translation = u_mouse * pixel;
    color.rgb += vec3(3.0) * lensflare(uv-0.5, u_camera.xy * 5., smoothstep(0.,0.1,1.0-sceneColor.a));

    color = mix(color, sceneColor, pct);

#else
    color = vec4(0.0,0.6,0.8,1.0);

#endif

    gl_FragColor = color;
}
