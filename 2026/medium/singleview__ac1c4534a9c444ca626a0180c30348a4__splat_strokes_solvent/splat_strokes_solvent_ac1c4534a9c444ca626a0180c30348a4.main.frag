// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_cameraTex;uniform sampler2D u_alignedTex;uniform sampler2D u_buffer0; // 0.25
uniform sampler2D u_buffer1; // 0.25
uniform sampler2D u_doubleBuffer0; // 0.1
uniform sampler2D u_doubleBuffer1;uniform sampler2D u_doubleBuffer2;uniform sampler2D u_scene;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform float u_cameraPct;uniform float u_cameraNearClip;uniform float u_cameraFarClip;uniform bool u_cameraDrag;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
#ifndef MAP_FLIP_Y
#define MAP_FLIP_Y 1
#endif
#ifndef MAP_WRAP
#define MAP_WRAP 0
#endif
#ifndef MAP_SAMEMARK_EPSILON
#define MAP_SAMEMARK_EPSILON (0.5/255.0)
#endif
#ifndef FNC_MAP
#define FNC_MAP
#ifndef MAP_INDEX_TEX
#define MAP_INDEX_TEX u_strokeIndicesTex
#define MAP_INDEX_RESOLUTION u_strokeIndicesTexResolution
uniform sampler2D u_strokeIndicesTex;uniform vec2 u_strokeIndicesTexResolution;
#endif
vec2 aI(vec2 uv){
#if MAP_FLIP_Y
uv.y=1.0-uv.y;
#endif
#if MAP_WRAP
uv=fract(uv);
#endif
return uv;}vec4 aT(sampler2D tex,vec2 uv){return texture2D(tex,aI(uv));}vec4 aE(vec2 uv){vec2 g=aI(uv);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aS(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
#define CAMERA_NEAR_CLIP u_cameraNearClip
#define CAMERA_FAR_CLIP u_cameraFarClip
#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/math/saturate.glsl"
#include "lygia/space/ratio.glsl"
#include "lygia/generative/random.glsl"
#include "lygia/generative/fbm.glsl"
#include "lygia/color/luma.glsl"
#include "lygia/sample/clamp2edge.glsl"
#define LUCASKANADE_SAMPLE_FNC(TEX, UV) luma(SAMPLER_FNC(TEX,UV).rgb)
#define LUCASKANADE_RADIUS 1
#define LUCASKANADE_EPSILON 0.001
#include "lygia/morphological/lucasKanade.glsl"
#define SPLAT_FLOW_SCALE 0.25
#define FLUID_SCALE 0.1
#define SPLAT_PUSH_FLUID 0.5
#define SPLAT_PUSH_INK 1.0
vec2 aF(vec2 st){return(texture2D(u_buffer0,st).xy*2.0-1.0)/SPLAT_FLOW_SCALE;}
#define RAYLEIGHTAYLOR_BOUNDARY
#define RAYLEIGHTAYLOR_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX,UV,u_resolution)*vec4(2.0,2.0,1.0,2.0)-vec4(1.0,1.0,0.0,1.0))
#define RAYLEIGHTAYLOR_GRAVITY vec2(0.0,-0.06)
#define RAYLEIGHTAYLOR_ATWOOD 0.8
#define RAYLEIGHTAYLOR_SOURCE_DENSITY_FNC(COLOR) (1.0-luma(COLOR.rgb))
#define RAYLEIGHTAYLOR_SOURCE_SAMPLER_FNC(TEX, UV) sampleClamp2edge(TEX,UV,u_resolution)
#define RAYLEIGHTAYLOR_SOURCE_PCT 0.03
#include "lygia/simulate/rayleighTaylor.glsl"
#define RT_FORCE 0.075
#define FLUIDSOLVER_FNC(T, S, P, V) rayleighTaylor(T,u_scene,S,P,V*RT_FORCE)
#define MARBLE_SAMPLER_FNC(TEX, UV) sampleClamp2edge(TEX,UV,u_resolution)
#include "lygia/distort/marble.glsl"
vec4 aB(vec2 uv){vec4 tex=sampleClamp2edge(u_scene,uv,u_resolution);tex.rgb*=1.25;return tex;}void main(void){vec4 A=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;
#if defined(BUFFER_0)
vec4 aM=texture2D(u_scene,st);vec4 prev=texture2D(u_buffer1,st);vec2 ay=vec2(0.0);if(aM.a>0.5||prev.a>0.5)ay=lucasKanade(u_scene,u_buffer1,st,pixel);A=vec4(saturate(ay*0.5+0.5),0.0,1.0);
#elif defined(BUFFER_1)
A=texture2D(u_scene,st);
#elif defined(DOUBLE_BUFFER_0)
float o=u_time*0.25;vec2 uv=ratio(st,u_resolution);vec2 O=vec2(0.0);O.x=fbm(uv*2.0-0.2*o);O.y=fbm(uv*3.0+0.23*o);vec2 r=vec2(0.);r.x=fbm(uv*4.0+2.0*O+vec2(1.7,9.2)+0.15*o);r.y=fbm(uv*6.0-2.0*O+vec2(8.3,2.8)+0.126*o);vec2 v=r*length(O);A=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)A=rayleighTaylorInit(u_scene,st);else A.xy+=aF(st)*FLUID_SCALE*SPLAT_PUSH_FLUID;A.xy=saturate(A.xy*0.5+0.5);A.z=saturate(A.z);A.w=saturate(A.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
vec2 vel=(texture2D(u_doubleBuffer0,st).xy*2.0-1.0)/FLUID_SCALE*MARBLE_FLOW_SPEED;vel+=aF(st)*SPLAT_PUSH_INK;vec2 p=st-vel*pixel;vec2 aA=p;if(!marbleReset(float(u_frame)))aA=marbleDecode(MARBLE_SAMPLER_FNC(u_doubleBuffer1,p));A=marbleEncode(aA);
#elif defined(DOUBLE_BUFFER_2)
A=texture2D(u_doubleBuffer2,st);vec4 tex=aB(st);if(marbleBake(float(u_frame))){A=marble(u_doubleBuffer2,u_doubleBuffer1,st)*MARBLE_FADE;A=mix(A,tex,tex.a);}if(u_cameraDrag)A=tex;
#elif defined(POSTPROCESSING)
vec4 aD=texture2D(u_doubleBuffer2,st);if(!marbleBake(float(u_frame)))aD=marble(u_doubleBuffer2,u_doubleBuffer1,st);vec4 tex=aB(st);A=mix(aD,tex,tex.a);A.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aJ=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 a7=v_texcoord.xy;vec4 aa=aE(v_uv);vec4 aP=aE(aJ);float a4=(aa.r*255.0*255.0+aa.g*255.0+aa.b*255.0)/(255.0*255.0);if(aa.a>=.5&&!aS(aa,aP))discard;vec4 tex=aT(u_alignedTex,aJ);A.rgb=pow(tex.rgb,vec3(1.25));
#else
A=v_color;
#endif
gl_FragColor=A;}
