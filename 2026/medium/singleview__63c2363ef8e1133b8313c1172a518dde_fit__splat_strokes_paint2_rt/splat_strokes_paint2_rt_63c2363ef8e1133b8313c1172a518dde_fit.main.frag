// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_backgroundTex;uniform sampler2D u_doubleBuffer0; // 0.25
uniform sampler2D u_doubleBuffer1;uniform sampler2D u_scene;uniform bool u_cameraDrag;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
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
vec2 aI(vec2 H){
#if MAP_FLIP_Y
H.y=1.0-H.y;
#endif
#if MAP_WRAP
H=fract(H);
#endif
return H;}vec4 aU(sampler2D tex,vec2 H){return texture2D(tex,aI(H));}vec4 aF(vec2 H){vec2 g=aI(H);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aT(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
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
#define DISPLACE_TO_AMOUNT length(vel.xy)
#define DISPLACE_DIRECTIONS 16
#include "lygia/distort/displace.glsl"
#include "lygia/sample/flow.glsl"
void main(void){vec4 F=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;float o=u_time*0.25;float aQ=pow(1.0-st.y,0.2);
#if defined(DOUBLE_BUFFER_0)
vec2 H=ratio(st,u_resolution);vec2 X=vec2(0.0);X.x=fbm(H*2.0-0.2*o);X.y=fbm(H*3.0+0.23*o);vec2 r=vec2(0.);r.x=fbm(H*4.0+2.0*X+vec2(4.7,9.2)+0.15*o);r.y=fbm(H*6.0-2.0*X+vec2(8.3,5.8)+0.126*o);vec2 v=r;F=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)F=rayleighTaylorInit(u_scene,st);F.xy=saturate(F.xy*0.5+0.5);F.z=saturate(F.z);F.w=saturate(F.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
vec4 tex=sampleClamp2edge(u_scene,st,u_resolution);vec4 aR=displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel);tex.a+=u_cameraDrag?0.01:0.0;F=mix(aR*(0.97+aQ*0.03),tex,tex.a);
#elif defined(POSTPROCESSING)
vec4 vel=texture2D(u_doubleBuffer0,st);vel.xy=vel.xy*2.0-1.0;F=sampleFlow(u_backgroundTex,st,vel.xy*pixel*10.0,u_time,3.15);F.rgb*=0.9;vec4 aE=texture2D(u_doubleBuffer1,st);F.rgb=mix(F.rgb,aE.rgb,aE.a);F.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aJ=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 a8=v_texcoord.xy;vec4 ab=aF(v_uv);vec4 aO=aF(aJ);float a5=(ab.r*255.0*255.0+ab.g*255.0+ab.b*255.0)/(255.0*255.0);if(ab.a>=.5&&!aT(ab,aO))discard;vec4 tex=aU(u_alignedTex,aJ);F.rgb=tex.rgb;
#else
F=v_color;
#endif
gl_FragColor=F;}
