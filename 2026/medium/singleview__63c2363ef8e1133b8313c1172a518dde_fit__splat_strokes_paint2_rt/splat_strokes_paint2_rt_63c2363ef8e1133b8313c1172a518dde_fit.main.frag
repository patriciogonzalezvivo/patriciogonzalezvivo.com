// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_doubleBuffer0; // 0.1
uniform sampler2D u_doubleBuffer1;uniform sampler2D u_scene;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform float u_cameraPct;uniform float u_cameraNearClip;uniform float u_cameraFarClip;uniform bool u_cameraDrag;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
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
vec2 aH(vec2 F){
#if MAP_FLIP_Y
F.y=1.0-F.y;
#endif
#if MAP_WRAP
F=fract(F);
#endif
return F;}vec4 aT(sampler2D tex,vec2 F){return texture2D(tex,aH(F));}vec4 aE(vec2 F){vec2 g=aH(F);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aS(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
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
#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX,UV,u_resolution)*2.0-1.0)
#define DISPLACE_FROM_CONDITION (sourceVal.a>=currVal.a)
#define DISPLACE_DIRECTIONS 16
#include "lygia/distort/displace.glsl"
void main(void){vec4 G=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;float o=u_time*0.25;float aP=pow(1.0-st.y,0.2);
#if defined(DOUBLE_BUFFER_0)
vec2 F=ratio(st,u_resolution);vec2 U=vec2(0.0);U.x=fbm(F*2.0-0.2*o);U.y=fbm(F*3.0+0.23*o);vec2 r=vec2(0.);r.x=fbm(F*4.0+2.0*U+vec2(1.7,9.2)+0.15*o);r.y=fbm(F*6.0-2.0*U+vec2(8.3,2.8)+0.126*o);vec2 v=r*length(U);G=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)G=rayleighTaylorInit(u_scene,st);G.xy=saturate(G.xy*0.5+0.5);G.z=saturate(G.z);G.w=saturate(G.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
vec4 tex=sampleClamp2edge(u_scene,st,u_resolution);vec4 aQ=displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel);tex.a+=u_cameraDrag?0.01:0.0;G.rgb=mix(aQ.rgb*(0.97+aP*0.03),tex.rgb,tex.a);
#elif defined(POSTPROCESSING)
vec4 aD=texture2D(u_doubleBuffer1,st);G.rgb=mix(G.rgb,aD.rgb,aD.a);G.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aI=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 a7=v_texcoord.xy;vec4 aa=aE(v_uv);vec4 aN=aE(aI);float a4=(aa.r*255.0*255.0+aa.g*255.0+aa.b*255.0)/(255.0*255.0);if(aa.a>=.5&&!aS(aa,aN))discard;vec4 tex=aT(u_alignedTex,aI);G.rgb=tex.rgb;
#else
G=v_color;
#endif
gl_FragColor=G;}
