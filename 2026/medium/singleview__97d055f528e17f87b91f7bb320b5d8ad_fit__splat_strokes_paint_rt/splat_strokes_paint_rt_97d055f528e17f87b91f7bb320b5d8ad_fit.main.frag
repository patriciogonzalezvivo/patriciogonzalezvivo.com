// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_backgroundTex;uniform sampler2D u_doubleBuffer0;uniform sampler2D u_doubleBuffer1;uniform sampler2D u_scene;uniform sampler2D u_sceneDepth;uniform sampler2D u_cameraTex;uniform sampler2D u_cameraNextTex;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform float u_cameraPct;uniform float u_cameraNearClip;uniform float u_cameraFarClip;uniform bool u_cameraDrag;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;uniform vec3 u_light;uniform vec3 u_lightColor;uniform float u_lightFalloff;uniform float u_lightIntensity;uniform float u_iblLuminance;uniform samplerCube u_cubeMap;uniform vec3 u_SH[9];varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
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
vec2 aA(vec2 G){
#if MAP_FLIP_Y
G.y=1.0-G.y;
#endif
#if MAP_WRAP
G=fract(G);
#endif
return G;}vec4 aM(sampler2D tex,vec2 G){return texture2D(tex,aA(G));}vec4 ax(vec2 G){vec2 g=aA(G);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aL(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
#define CAMERA_NEAR_CLIP u_cameraNearClip
#define CAMERA_FAR_CLIP u_cameraFarClip
#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/math/saturate.glsl"
#include "lygia/math/decimate.glsl"
#include "lygia/space/ratio.glsl"
#include "lygia/space/scale.glsl"
#include "lygia/space/decimateNormal.glsl"
#include "lygia/space/linearizeDepth.glsl"
#include "lygia/generative/random.glsl"
#include "lygia/generative/curl.glsl"
#include "lygia/generative/fbm.glsl"
#include "lygia/color/space/srgb2rgb.glsl"
#include "lygia/color/luma.glsl"
#include "lygia/sample/clamp2edge.glsl"
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
#include "lygia/color/mixSpectral.glsl"
#define DISPLACE_FNC(A,B,C) mixSpectral(A,B,C)
#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX,UV,u_resolution)*2.0-1.0)
#define DISPLACE_FROM_CONDITION (sourceVal.a>=currVal.a)
#define DISPLACE_DIRECTIONS 16
#include "lygia/distort/displace.glsl"
#define PAINT_DECAY .99
#define FLUID_EXTEND_RADIUS 1
void main(void){vec4 o=vec4(vec3(0.0),0.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;float t=u_time*0.25;
#if defined(DOUBLE_BUFFER_0)
float depth=linearizeDepth(texture2D(u_sceneDepth,st).x);vec2 G=ratio(st,u_resolution);vec2 X=vec2(0.0);float scale=(15.0-clamp(depth,0.0,10.0));X.x=fbm(G*(scale+2.0)-0.2*t);X.y=fbm(G*(scale+3.0)+0.23*t);vec2 v=X;o=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)o=rayleighTaylorInit(u_scene,st);o.xy=saturate(o.xy*0.5+0.5);o.z=saturate(o.z);o.w=saturate(o.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
vec4 tex=sampleClamp2edge(u_scene,st,u_resolution);vec4 aJ=displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel);tex.a+=u_cameraDrag?0.05:0.0;o=mix(aJ,tex,tex.a);float depth=linearizeDepth(texture2D(u_sceneDepth,st).x);o*=1.0-clamp(depth,0.0,10.0)*0.0005;
#elif defined(POSTPROCESSING)
o=texture2D(u_backgroundTex,st);vec4 aw=texture2D(u_doubleBuffer1,st);float aI=clamp(pow(length(u_cameraTrg-u_camera),.2),0.0,1.0);o=mix(texture2D(u_alignedTex,fract(st)),o,aI);o.rgb=mix(o.rgb,aw.rgb,aw.a);o.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 ag=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 aU=v_texcoord.xy;vec4 W=ax(v_uv);vec4 aF=ax(ag);float aG=(W.r*255.0*255.0+W.g*255.0+W.b*255.0)/(255.0*255.0);if(W.a>=.5&&!aL(W,aF))discard;vec4 tex=aM(u_alignedTex,ag);float l=pow(luma(tex.rgb),10.);o.rgb=tex.rgb;o.a=step(0.5,u_cameraDrag?1.0:l+(aU.x)*0.5+fract(aG+t-ag.y));
#else
Material material=materialNew();material.metallic=0.0;material.roughness=0.9;o=pbr(material);o=linear2gamma(o);
#endif
gl_FragColor=o;}
