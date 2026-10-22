// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_doubleBuffer0; // 0.1
uniform sampler2D u_doubleBuffer1;uniform sampler2D u_doubleBuffer2;uniform sampler2D u_scene;uniform sampler2D u_sceneBuffer0;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform float u_cameraPct;uniform float u_cameraNearClip;uniform float u_cameraFarClip;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;varying vec2 v_vel;
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
vec2 ae(vec2 o){
#if MAP_FLIP_Y
o.y=1.0-o.y;
#endif
#if MAP_WRAP
o=fract(o);
#endif
return o;}vec4 aQ(sampler2D tex,vec2 o){return texture2D(tex,ae(o));}vec4 al(vec2 o){vec2 g=ae(o);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aP(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
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
#define FLUID_SCALE 0.1
#define STROKE_DRAG_FLUID 0.6
#define STROKE_DRAG_INK 1.0
vec3 aR(vec2 st,vec2 a6){vec3 Z=vec3(0.0);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec4 s=texture2D(u_sceneBuffer0,st+vec2(float(i),float(j))*a6/3.0);Z+=vec3(s.xy*s.a,s.a);}Z/=9.0;return vec3(Z.xy/max(Z.z,1e-4),Z.z);}
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
#define MARBLE_PERIOD 60.0
#define MARBLE_FADE 0.985
#define MARBLE_FLOW_SPEED 1.0
vec4 a4(vec2 o){vec2 m=clamp((o+0.5)*0.5,0.0,1.0)*255.0;vec2 ai=floor(m);return vec4(ai.x/255.0,m.x-ai.x,ai.y/255.0,m.y-ai.y);}vec2 as(vec4 c){return(c.rb*255.0+c.ga)/255.0*2.0-0.5;}vec4 aK(vec2 o){return sampleClamp2edge(u_doubleBuffer2,o,u_resolution);}vec4 aL(vec2 o){return sampleClamp2edge(u_scene,o,u_resolution);}void main(void){vec4 E=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;
#if defined(DOUBLE_BUFFER_0)
float A=u_time*0.25;vec2 o=ratio(st,u_resolution);vec2 U=vec2(0.0);U.x=fbm(o*2.0-0.2*A);U.y=fbm(o*3.0+0.23*A);vec2 r=vec2(0.);r.x=fbm(o*4.0+2.0*U+vec2(1.7,9.2)+0.15*A);r.y=fbm(o*6.0-2.0*U+vec2(8.3,2.8)+0.126*A);vec2 v=r*length(U);E=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)E=rayleighTaylorInit(u_scene,st);else{vec3 ad=aR(st,pixel);E.xy=mix(E.xy,ad.xy*FLUID_SCALE,saturate(ad.z*STROKE_DRAG_FLUID));}E.xy=saturate(E.xy*0.5+0.5);E.z=saturate(E.z);E.w=saturate(E.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
vec2 vel=(texture2D(u_doubleBuffer0,st).xy*2.0-1.0)/FLUID_SCALE*MARBLE_FLOW_SPEED;vec3 ad=aR(st,pixel);vel=mix(vel,ad.xy,saturate(ad.z*STROKE_DRAG_INK));vec2 p=st-vel*pixel;vec2 aJ=p;if(mod(float(u_frame),MARBLE_PERIOD)>0.5&&u_frame>0)aJ=as(sampleClamp2edge(u_doubleBuffer1,p,u_resolution));E=a4(aJ);
#elif defined(DOUBLE_BUFFER_2)
E=texture2D(u_doubleBuffer2,st);if(mod(float(u_frame),MARBLE_PERIOD)>MARBLE_PERIOD-1.5||u_frame<1){E=aK(as(texture2D(u_doubleBuffer1,st)))*MARBLE_FADE;vec4 tex=aL(st);E.rgb=mix(E.rgb,tex.rgb,tex.a);E.a=1.0;}
#elif defined(POSTPROCESSING)
vec4 aO=texture2D(u_doubleBuffer2,st);if(mod(float(u_frame),MARBLE_PERIOD)<MARBLE_PERIOD-1.5&&u_frame>0)aO=aK(as(texture2D(u_doubleBuffer1,st)));vec4 tex=aL(st);E.rgb=mix(aO.rgb,tex.rgb,tex.a);E.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aV=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 bl=v_texcoord.xy;vec4 ab=al(v_uv);vec4 a3=al(aV);float bi=(ab.r*255.0*255.0+ab.g*255.0+ab.b*255.0)/(255.0*255.0);if(ab.a>=.5&&!aP(ab,a3))discard;vec4 tex=aQ(u_alignedTex,aV);E.rgb=tex.rgb;
#if defined(SCENE_BUFFER_0)
E=vec4(v_vel,0.0,1.0);
#endif
#else
E=v_color;
#if defined(SCENE_BUFFER_0)
E=vec4(0.0);
#endif
#endif
gl_FragColor=E;}
