// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_backgroundTex;uniform sampler2D u_doubleBuffer0; // 0.1
uniform sampler2D u_doubleBuffer1;uniform sampler2D u_doubleBuffer2;uniform sampler2D u_scene;uniform sampler2D u_sceneBuffer0;uniform bool u_cameraDrag;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;varying vec2 v_vel;
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
vec2 af(vec2 uv){
#if MAP_FLIP_Y
uv.y=1.0-uv.y;
#endif
#if MAP_WRAP
uv=fract(uv);
#endif
return uv;}vec4 aM(sampler2D tex,vec2 uv){return texture2D(tex,af(uv));}vec4 al(vec2 uv){vec2 g=af(uv);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aL(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/math/saturate.glsl"
#include "lygia/space/ratio.glsl"
#include "lygia/generative/random.glsl"
#include "lygia/generative/fbm.glsl"
#include "lygia/color/luma.glsl"
#include "lygia/sample/clamp2edge.glsl"
#define FLUID_SCALE 0.1
#define STROKE_DRAG_FLUID 0.6
#define STROKE_DRAG_INK 1.0
vec3 aN(vec2 st,vec2 aZ){vec3 Z=vec3(0.0);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec4 s=texture2D(u_sceneBuffer0,st+vec2(float(i),float(j))*aZ/3.0);Z+=vec3(s.xy*s.a,s.a);}Z/=9.0;return vec3(Z.xy/max(Z.z,1e-4),Z.z);}
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
#ifndef MARBLE_PERIOD
#define MARBLE_PERIOD 60.0
#endif
#ifndef MARBLE_FADE
#define MARBLE_FADE 0.985
#endif
#ifndef MARBLE_FLOW_SPEED
#define MARBLE_FLOW_SPEED 1.0
#endif
#define MARBLE_SAMPLER_FNC(TEX, UV) sampleClamp2edge(TEX,UV,u_resolution)
#include "lygia/distort/marble.glsl"
#include "lygia/sample/flow.glsl"
void main(void){vec4 o=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;
#if defined(DOUBLE_BUFFER_0)
float E=u_time*0.25;vec2 uv=ratio(st,u_resolution);vec2 U=vec2(0.0);U.x=fbm(uv*2.0-0.2*E);U.y=fbm(uv*3.0+0.23*E);vec2 r=vec2(0.);r.x=fbm(uv*4.0+2.0*U+vec2(1.7,9.2)+0.15*E);r.y=fbm(uv*6.0-2.0*U+vec2(8.3,2.8)+0.126*E);vec2 v=r*length(U);o=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)o=rayleighTaylorInit(u_scene,st);else{vec3 ae=aN(st,pixel);o.xy=mix(o.xy,ae.xy*FLUID_SCALE,saturate(ae.z*STROKE_DRAG_FLUID));}o.xy=saturate(o.xy*0.5+0.5);o.z=saturate(o.z);o.w=saturate(o.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
vec2 vel=(texture2D(u_doubleBuffer0,st).xy*2.0-1.0)/FLUID_SCALE*MARBLE_FLOW_SPEED;vec3 ae=aN(st,pixel);vel=mix(vel,ae.xy,saturate(ae.z*STROKE_DRAG_INK));vec2 p=st-vel*pixel;vec2 aI=p;if(!marbleReset(float(u_frame)))aI=marbleDecode(MARBLE_SAMPLER_FNC(u_doubleBuffer1,p));o=marbleEncode(aI);
#elif defined(DOUBLE_BUFFER_2)
o=texture2D(u_doubleBuffer2,st);vec4 tex=texture2D(u_scene,st);if(marbleBake(float(u_frame))){o=marble(u_doubleBuffer2,u_doubleBuffer1,st)*MARBLE_FADE;o=mix(o,tex,tex.a);}if(u_cameraDrag)o=tex;
#elif defined(POSTPROCESSING)
vec4 vel=texture2D(u_doubleBuffer0,st);vel.xy=vel.xy*2.0-1.0;o=sampleFlow(u_backgroundTex,st,vel.xy*pixel*50.0,u_time,3.15);o.rgb*=0.9;vec4 ad=texture2D(u_doubleBuffer2,st);if(!marbleBake(float(u_frame)))ad=marble(u_doubleBuffer2,u_doubleBuffer1,st);ad=mix(o,ad,ad.a);vec4 tex=texture2D(u_scene,st);o.rgb=mix(ad.rgb,tex.rgb,tex.a);o.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aR=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 bf=v_texcoord.xy;vec4 ab=al(v_uv);vec4 aX=al(aR);float bc=(ab.r*255.0*255.0+ab.g*255.0+ab.b*255.0)/(255.0*255.0);if(ab.a>=.5&&!aL(ab,aX))discard;vec4 tex=aM(u_alignedTex,aR);o.rgb=tex.rgb;
#if defined(SCENE_BUFFER_0)
o=vec4(v_vel,0.0,1.0);
#endif
#else
o=v_color;
#if defined(SCENE_BUFFER_0)
o=vec4(0.0);
#endif
#endif
gl_FragColor=o;}
