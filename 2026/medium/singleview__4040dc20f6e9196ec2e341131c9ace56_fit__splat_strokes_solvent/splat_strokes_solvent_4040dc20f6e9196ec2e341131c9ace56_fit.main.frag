// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_cameraTex;uniform sampler2D u_alignedTex;uniform sampler2D u_backgroundTex;uniform sampler2D u_buffer0; // 0.25
uniform sampler2D u_buffer1; // 0.25
uniform sampler2D u_doubleBuffer0; // 0.1
uniform sampler2D u_doubleBuffer1;uniform sampler2D u_doubleBuffer2;uniform sampler2D u_scene;uniform bool u_cameraDrag;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform int u_change;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
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
vec2 aJ(vec2 uv){
#if MAP_FLIP_Y
uv.y=1.0-uv.y;
#endif
#if MAP_WRAP
uv=fract(uv);
#endif
return uv;}vec4 aU(sampler2D tex,vec2 uv){return texture2D(tex,aJ(uv));}vec4 aF(vec2 uv){vec2 g=aJ(uv);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aT(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
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
vec2 aG(vec2 st){return(texture2D(u_buffer0,st).xy*2.0-1.0)/SPLAT_FLOW_SCALE;}
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
#include "lygia/sample/flow.glsl"
vec4 aD(vec2 uv){vec4 tex=sampleClamp2edge(u_scene,uv,u_resolution);tex.rgb*=1.25;return tex;}void main(void){vec4 o=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;
#if defined(BUFFER_0)
vec4 aN=texture2D(u_scene,st);vec4 prev=texture2D(u_buffer1,st);vec2 aA=vec2(0.0);if(aN.a>0.5||prev.a>0.5)aA=lucasKanade(u_scene,u_buffer1,st,pixel);o=vec4(saturate(aA*0.5+0.5),0.0,1.0);
#elif defined(BUFFER_1)
o=texture2D(u_scene,st);
#elif defined(DOUBLE_BUFFER_0)
float E=u_time*0.25;vec2 uv=ratio(st,u_resolution);vec2 Q=vec2(0.0);Q.x=fbm(uv*2.0-0.2*E);Q.y=fbm(uv*3.0+0.23*E);vec2 r=vec2(0.);r.x=fbm(uv*4.0+2.0*Q+vec2(1.7,9.2)+0.15*E);r.y=fbm(uv*6.0-2.0*Q+vec2(8.3,2.8)+0.126*E);vec2 v=r*length(Q);o=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,v);if(u_frame<2)o=rayleighTaylorInit(u_scene,st);else o.xy+=aG(st)*FLUID_SCALE*SPLAT_PUSH_FLUID;o.xy=saturate(o.xy*0.5+0.5);o.z=saturate(o.z);o.w=saturate(o.w*0.5+0.5);
#elif defined(DOUBLE_BUFFER_1)
vec2 vel=(texture2D(u_doubleBuffer0,st).xy*2.0-1.0)/FLUID_SCALE*MARBLE_FLOW_SPEED;vel+=aG(st)*SPLAT_PUSH_INK;vec2 p=st-vel*pixel;vec2 aC=p;if(!marbleReset(float(u_frame)))aC=marbleDecode(MARBLE_SAMPLER_FNC(u_doubleBuffer1,p));o=marbleEncode(aC);
#elif defined(DOUBLE_BUFFER_2)
o=texture2D(u_doubleBuffer2,st);vec4 tex=aD(st);if(marbleBake(float(u_frame))){o=marble(u_doubleBuffer2,u_doubleBuffer1,st)*MARBLE_FADE;o=mix(o,tex,tex.a);}if(u_cameraDrag)o=tex;
#elif defined(POSTPROCESSING)
vec4 vel=texture2D(u_doubleBuffer0,st);vel.xy=vel.xy*2.0-1.0;o=sampleFlow(u_backgroundTex,st,vel.xy*pixel*50.0,u_time,3.15);o.rgb*=0.9;vec4 ac=texture2D(u_doubleBuffer2,st);if(!marbleBake(float(u_frame)))ac=marble(u_doubleBuffer2,u_doubleBuffer1,st);ac=mix(o,ac,ac.a);vec4 tex=aD(st);o=mix(ac,tex,tex.a);o.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aK=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 a8=v_texcoord.xy;vec4 ab=aF(v_uv);vec4 aQ=aF(aK);float a5=(ab.r*255.0*255.0+ab.g*255.0+ab.b*255.0)/(255.0*255.0);if(ab.a>=.5&&!aT(ab,aQ))discard;vec4 tex=aU(u_alignedTex,aK);o.rgb=pow(tex.rgb,vec3(1.25));
#else
o=v_color;
#endif
gl_FragColor=o;}
