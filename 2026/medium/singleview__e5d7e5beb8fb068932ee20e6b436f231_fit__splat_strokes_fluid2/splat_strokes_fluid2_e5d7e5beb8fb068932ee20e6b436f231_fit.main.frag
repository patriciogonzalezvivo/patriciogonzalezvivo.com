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
#include "lygia/color/luminance.glsl"
#include "lygia/color/space/rgb2srgb.glsl"
#define FBM_OCTAVES 8
#include "lygia/generative/fbm.glsl"
#define RAYLEIGHTAYLOR_SAMPLER_FNC(TEX, UV) (SAMPLER_FNC(TEX,UV)*vec4(2.0,2.0,1.0,2.0)-vec4(1.0,1.0,0.0,1.0))
#define RAYLEIGHTAYLOR_ATWOOD 0.8
#define RAYLEIGHTAYLOR_MEAN_RADIUS 20.0
#define RAYLEIGHTAYLOR_DIFFUSION 0.03
#define RAYLEIGHTAYLOR_DAMPING 0.99
#define RAYLEIGHTAYLOR_BOUNDARY
#define RAYLEIGHTAYLOR_SOURCE_PCT 0.03
#include "lygia/simulate/rayleighTaylor.glsl"
#define RT_FORCE 0.04
#define FLUIDSOLVER_FNC(T, S, P, V) rayleighTaylor(T,u_scene,S,P,V*RT_FORCE)
#define MIXSPECTRAL_SRGB
#include "lygia/color/mixSpectral.glsl"
#define PAINT_MIX_EDGE0 0.12
#define PAINT_MIX_EDGE1 0.45
vec4 a3(vec4 A,vec4 B,float t){t=smoothstep(PAINT_MIX_EDGE0,PAINT_MIX_EDGE1,t);if(t<=0.0)return A;if(t>=1.0)return B;return mixSpectral(A,B,t);}
#define DISPLACE_FNC(A,B,C) a3(A,B,C)
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
vec2 aM(vec2 o){
#if MAP_FLIP_Y
o.y=1.0-o.y;
#endif
#if MAP_WRAP
o=fract(o);
#endif
return o;}vec4 a6(sampler2D tex,vec2 o){return texture2D(tex,aM(o));}vec4 aI(vec2 o){vec2 g=aM(o);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool a5(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
#define PAINT_HEIGHT_SHADING
#define PAINT_HEIGHT_RADIUS 2.5
#define PAINT_HEIGHT_SCALE 1.0
#define PAINT_HEIGHT_COVER 1.6
#define PAINT_HEIGHT_DENSITY 0.5
#define PAINT_HEIGHT_FLOW 0.5
#define PAINT_HEIGHT_GRAIN 0.25
#define PAINT_LIGHT_DIR vec3(-0.5,0.6,0.65)
#define PAINT_DIFFUSE 1.5
#define PAINT_SPECULAR 0.5
#define PAINT_SPECULAR_POWER 100.0
#if defined(POSTPROCESSING) && defined(PAINT_HEIGHT_SHADING)
float bf(vec2 o){vec4 p=texture2D(u_doubleBuffer1,o);vec4 aJ=texture2D(u_doubleBuffer0,o);vec2 vel=aJ.xy*2.0-1.0;float ak=length(vel);vec2 dir=ak>1e-4?vel/ak:vec2(1.0,0.0);vec2 N=vec2(dot(o*u_resolution,dir),dot(o*u_resolution,vec2(-dir.y,dir.x)));float aU=fbm(vec2(N.x*0.01,N.y*0.15))-0.5;float h=p.a*PAINT_HEIGHT_COVER+aJ.z*p.a*PAINT_HEIGHT_DENSITY+ak*PAINT_HEIGHT_FLOW+aU*PAINT_HEIGHT_GRAIN*smoothstep(0.0,0.1,ak)*p.a;return h;}
#endif
void main(void){vec4 F=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;
#if defined(DOUBLE_BUFFER_0)
vec2 o=ratio(st,u_resolution);vec2 N=vec2(0.0);N.x=fbm(o+0.01*u_time);N.y=fbm(o+0.013*u_time);vec2 r=vec2(0.);r.x=fbm(o*2.0+2.0*N+vec2(1.7,9.2)+0.15*u_time);r.y=fbm(o*2.0+2.0*N+vec2(8.3,2.8)+0.126*u_time);vec2 v=r*length(N);float aG=texture2D(u_scene,st).a;v*=aG;vec3 ai=texture2D(u_pyramid0,st+v).rgb*2.0-1.0;float ac=1.0-dot(ai,vec3(0.0,0.0,1.0));v+=ai.xy*pixel*ac*aG;F=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)F=rayleighTaylorInit(u_scene,st);F.xy=saturate(F.xy*0.5+0.5);F.z=saturate(F.z);F.w=saturate(F.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
float aQ=texture2D(u_scene,st).a;F=displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel);vec4 tex=texture2D(u_scene,st);F=a3(F,tex,aQ);F.rgb*=0.998;
#elif defined(POSTPROCESSING)
F=texture2D(u_backgroundTex,st);vec4 Y=texture2D(u_doubleBuffer1,st);
#if defined(PAINT_HEIGHT_SHADING)
vec2 ah=pixel*PAINT_HEIGHT_RADIUS;
#define PAINT_H(UV) bf(UV)
float h=PAINT_H(st);float aW=PAINT_H(st+vec2(ah.x,0.0))-PAINT_H(st-vec2(ah.x,0.0));float aX=PAINT_H(st+vec2(0.0,ah.y))-PAINT_H(st-vec2(0.0,ah.y));vec3 aE=normalize(vec3(-aW*PAINT_HEIGHT_SCALE,-aX*PAINT_HEIGHT_SCALE,1.0));vec3 L=normalize(PAINT_LIGHT_DIR);vec3 aO=normalize(L+vec3(0.0,0.0,1.0));float aS=dot(aE,L);float a8=pow(max(dot(aE,aO),0.0),PAINT_SPECULAR_POWER);float a7=aS-L.z;vec3 aZ=Y.rgb*(1.0+a7*PAINT_DIFFUSE)+vec3(a8*PAINT_SPECULAR);Y.rgb=mix(Y.rgb,aZ,saturate(Y.a));
#endif
F=mix(F,Y,Y.a);
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aN=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec4 aF=aI(v_uv);vec4 aY=aI(aN);if(aF.a>=.5&&!a5(aF,aY))discard;F.rgb=a6(u_alignedTex,aN).rgb;
#if defined(SCENE_BUFFER_NORMAL)
vec3 ai=v_normal;F.rgb=ai*0.5+0.5;
#endif
#elif defined(PYRAMID_0)
F=texture2D(u_sceneNormal,st);
#else
F=v_color;
#endif
gl_FragColor=F;}
