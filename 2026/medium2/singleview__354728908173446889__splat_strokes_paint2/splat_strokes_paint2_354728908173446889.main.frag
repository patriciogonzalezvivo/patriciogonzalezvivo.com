// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_doubleBuffer0; // 0.1
uniform sampler2D u_doubleBuffer1;uniform sampler2D u_scene;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform float u_cameraPct;uniform float u_cameraNearClip;uniform float u_cameraFarClip;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
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
vec2 aF(vec2 E){
#if MAP_FLIP_Y
E.y=1.0-E.y;
#endif
#if MAP_WRAP
E=fract(E);
#endif
return E;}vec4 aQ(sampler2D tex,vec2 E){return texture2D(tex,aF(E));}vec4 aC(vec2 E){vec2 g=aF(E);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aP(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
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
#define LATTICEBOLTZMANN_BOUNDARY
#define LATTICEBOLTZMANN_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX,UV,u_resolution)*2.0-1.0)
#include "lygia/simulate/latticeBoltzmann.glsl"
#define FLUIDSOLVER_FNC(T, S, P, V) latticeBoltzmann(T,S,P,V*75.0)
#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX,UV,u_resolution)*2.0-1.0)
#define DISPLACE_FROM_CONDITION (sourceVal.a>=currVal.a)
#define DISPLACE_DIRECTIONS 16
#include "lygia/distort/displace.glsl"
void main(void){vec4 F=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;float o=u_time*0.25;float aB=pow(1.0-st.y,0.2);
#if defined(DOUBLE_BUFFER_0)
vec2 E=ratio(st,u_resolution);vec2 O=vec2(0.0);O.x=fbm(E*2.0-0.2*o);O.y=fbm(E*3.0+0.23*o);vec2 r=vec2(0.);r.x=fbm(E*4.0+2.0*O+vec2(1.7,9.2)+0.15*o);r.y=fbm(E*6.0-2.0*O+vec2(8.3,2.8)+0.126*o);vec2 v=r*length(O);F=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);F.xy*=aB;F.xy=saturate(F.xy*0.5+0.5);F.z=saturate(F.z);F.w=1.0;
#elif defined(DOUBLE_BUFFER_1)
vec4 tex=sampleClamp2edge(u_scene,st,u_resolution);vec4 aN=displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel);F.rgb=mix(aN.rgb*(0.97+aB*0.03),tex.rgb,tex.a);
#elif defined(POSTPROCESSING)
vec4 aA=texture2D(u_doubleBuffer1,st);F.rgb=mix(F.rgb,aA.rgb,aA.a);F.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aG=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 a4=v_texcoord.xy;vec4 X=aC(v_uv);vec4 aL=aC(aG);float aZ=(X.r*255.0*255.0+X.g*255.0+X.b*255.0)/(255.0*255.0);if(X.a>=.5&&!aP(X,aL))discard;vec4 tex=aQ(u_alignedTex,aG);F.rgb=tex.rgb;
#else
F=v_color;
#endif
gl_FragColor=F;}
