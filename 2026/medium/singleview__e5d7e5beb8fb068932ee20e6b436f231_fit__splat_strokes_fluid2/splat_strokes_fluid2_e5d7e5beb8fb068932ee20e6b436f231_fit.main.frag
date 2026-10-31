// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_backgroundTex;uniform sampler2D u_doubleBuffer0;uniform sampler2D u_doubleBuffer1;uniform sampler2D u_scene;uniform sampler2D u_sceneNormal;uniform sampler2D u_pyramid0;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform float u_cameraPct;uniform float u_cameraNearClip;uniform float u_cameraFarClip;uniform float u_cameraDistance;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/space/ratio.glsl"
#define FBM_OCTAVES 8
#include "lygia/generative/fbm.glsl"
#include "lygia/color/luminance.glsl"
#define RAYLEIGHTAYLOR_SAMPLER_FNC(TEX, UV) (SAMPLER_FNC(TEX,UV)*vec4(2.0,2.0,1.0,2.0)-vec4(1.0,1.0,0.0,1.0))
#define RAYLEIGHTAYLOR_ATWOOD 0.8
#define RAYLEIGHTAYLOR_DIFFUSION 0.01
#define RAYLEIGHTAYLOR_DAMPING 0.995
#define RAYLEIGHTAYLOR_BOUNDARY
#define RAYLEIGHTAYLOR_SOURCE_PCT 0.03
#include "lygia/simulate/rayleighTaylor.glsl"
#define RT_FORCE 0.04
#define FLUIDSOLVER_FNC(T, S, P, V) rayleighTaylor(T,u_scene,S,P,V*RT_FORCE)
#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) (SAMPLER_FNC(TEX,UV)*2.0-1.0)
#define DISPLACE_FROM_CONDITION (sourceVal.a>=currVal.a)
#define DISPLACE_TO_AMOUNT (1.0-abs(currVel.z))*0.5
#include "lygia/distort/displace.glsl"
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
vec2 aH(vec2 G){
#if MAP_FLIP_Y
G.y=1.0-G.y;
#endif
#if MAP_WRAP
G=fract(G);
#endif
return G;}vec4 aR(sampler2D tex,vec2 G){return texture2D(tex,aH(G));}vec4 aE(vec2 G){vec2 g=aH(G);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aQ(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
void main(void){vec4 A=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;
#if defined(DOUBLE_BUFFER_0)
vec2 G=ratio(st,u_resolution);vec2 O=vec2(0.0);O.x=fbm(G+0.01*u_time);O.y=fbm(G+0.013*u_time);vec2 r=vec2(0.);r.x=fbm(G*2.0+2.0*O+vec2(1.7,9.2)+0.15*u_time);r.y=fbm(G*2.0+2.0*O+vec2(8.3,2.8)+0.126*u_time);vec2 v=r*length(O);vec3 ac=texture2D(u_pyramid0,st+v).rgb*2.0-1.0;float Z=1.0-dot(ac,vec3(0.0,0.0,1.0));v+=ac.xy*pixel*Z+O;A=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)A=rayleighTaylorInit(u_scene,st);A.xy=saturate(A.xy*0.5+0.5);A.z=saturate(A.z);A.w=saturate(A.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
float aK=texture2D(u_scene,st).a;A=displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel);vec4 tex=texture2D(u_scene,st);A=mix(A,tex,aK);A.rgb*=0.998;
#elif defined(POSTPROCESSING)
A=texture2D(u_backgroundTex,st);vec4 aD=texture2D(u_doubleBuffer1,st);A=mix(A,aD,aD.a);
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aI=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec4 aB=aE(v_uv);vec4 aN=aE(aI);if(aB.a>=.5&&!aQ(aB,aN))discard;A.rgb=aR(u_alignedTex,aI).rgb;
#if defined(SCENE_BUFFER_NORMAL)
vec3 ac=v_normal;A.rgb=ac*0.5+0.5;
#endif
#elif defined(PYRAMID_0)
A=texture2D(u_sceneNormal,st);
#else
A=v_color;
#endif
gl_FragColor=A;}
