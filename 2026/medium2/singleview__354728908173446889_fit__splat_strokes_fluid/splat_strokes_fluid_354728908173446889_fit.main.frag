// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_doubleBuffer0;uniform sampler2D u_doubleBuffer1;uniform sampler2D u_scene;uniform sampler2D u_sceneNormal;uniform sampler2D u_pyramid0;uniform sampler2D u_cameraTex;uniform sampler2D u_cameraNextTex;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform float u_cameraPct;uniform float u_cameraNearClip;uniform float u_cameraFarClip;uniform float u_cameraDistance;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/space/ratio.glsl"
#define FBM_OCTAVES 8
#include "lygia/generative/fbm.glsl"
#define LATTICEBOLTZMANN_SAMPLER_FNC(TEX, UV) (SAMPLER_FNC(TEX,UV)*2.0-1.0)
#include "lygia/simulate/latticeBoltzmann.glsl"
#define FLUIDSOLVER_FNC(T, S, P, V) latticeBoltzmann(T,S,P,V*75.0)
#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) (SAMPLER_FNC(TEX,UV)*2.0-1.0)
#define DISPLACE_FROM_CONDITION (sourceVal.a>=currVal.a)
#define DISPLACE_TO_AMOUNT 1.0-(currVel.w*0.5+0.5)
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
vec2 aD(vec2 F){
#if MAP_FLIP_Y
F.y=1.0-F.y;
#endif
#if MAP_WRAP
F=fract(F);
#endif
return F;}vec4 aN(sampler2D tex,vec2 F){return texture2D(tex,aD(F));}vec4 aA(vec2 F){vec2 g=aD(F);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aM(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
void main(void){vec4 B=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;
#if defined(DOUBLE_BUFFER_0)
vec2 F=ratio(st,u_resolution);vec2 M=vec2(0.0);M.x=fbm(F+0.01*u_time);M.y=fbm(F+0.013*u_time);vec2 r=vec2(0.);r.x=fbm(F*2.0+2.0*M+vec2(1.7,9.2)+0.15*u_time);r.y=fbm(F*2.0+2.0*M+vec2(8.3,2.8)+0.126*u_time);vec2 v=r*length(M);vec3 Z=texture2D(u_pyramid0,st+v).rgb*2.0-1.0;float W=1.0-dot(Z,vec3(0.0,0.0,1.0));v+=Z.xy*pixel*W+M;B=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);B.xy*=0.99;B.xy=saturate(B.xy*0.5+0.5);B.z=saturate(B.z);B.w=1.0;
#elif defined(DOUBLE_BUFFER_1)
float aG=texture2D(u_scene,st).a;B=displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel);vec4 tex=texture2D(u_scene,st);B=mix(B,tex,aG);B.rgb*=0.998;
#elif defined(POSTPROCESSING)
B=texture2D(u_doubleBuffer1,st);
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aE=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec4 ay=aA(v_uv);vec4 aJ=aA(aE);if(ay.a>=.5&&!aM(ay,aJ))discard;B.rgb=aN(u_alignedTex,aE).rgb;
#if defined(SCENE_BUFFER_NORMAL)
vec3 Z=v_normal;B.rgb=Z*0.5+0.5;
#endif
#elif defined(PYRAMID_0)
B=texture2D(u_sceneNormal,st);
#else
B=v_color;
#endif
gl_FragColor=B;}
