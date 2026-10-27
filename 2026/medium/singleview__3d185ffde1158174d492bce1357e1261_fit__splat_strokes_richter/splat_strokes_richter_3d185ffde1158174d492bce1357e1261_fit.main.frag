// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_depthTex;uniform sampler2D u_backgroundTex;uniform sampler2D u_doubleBuffer0; // 0.5
uniform sampler2D u_doubleBuffer1;uniform sampler2D u_doubleBuffer2; // 0.1
uniform sampler2D u_scene;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform bool u_cameraDrag;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
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
vec2 a9(vec2 F){
#if MAP_FLIP_Y
F.y=1.0-F.y;
#endif
#if MAP_WRAP
F=fract(F);
#endif
return F;}vec4 bn(sampler2D tex,vec2 F){return texture2D(tex,a9(F));}vec4 a4(vec2 F){vec2 g=a9(F);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool bm(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
#include "lygia/sampler.glsl"
#include "lygia/math/const.glsl"
#include "lygia/generative/random.glsl"
#include "lygia/generative/snoise.glsl"
#include "lygia/color/luma.glsl"
#include "lygia/space/ratio.glsl"
#include "lygia/math/saturate.glsl"
#include "lygia/generative/fbm.glsl"
#include "lygia/sample/clamp2edge.glsl"
#include "lygia/color/space/srgb2oklab.glsl"
#include "lygia/color/space/oklab2srgb.glsl"
#define RICHTER_LAYERS 2
#define RICHTER_PERIOD_MIN 8.0
#define RICHTER_PERIOD_MAX 20.0
#define RICHTER_DUTY 0.8
#define RICHTER_SPEED 3.0
#define RICHTER_BAND_PX 1.5
#define RICHTER_BAND_WAVE 7.0
#define RICHTER_BAND_FREQ 0.012
#define RICHTER_SKIP 0.15
#define RICHTER_SMEAR 0.25
#define RICHTER_FLUID_FORCE 0.5
#define RICHTER_FLUID_SLOW 0.5
#define RICHTER_FLUID_TIME 0.51
#define RICHTER_FLUID_SCALE 1.0
#define RICHTER_DRYING 0.01
#define RICHTER_WET_REACH 0.06
#define RICHTER_DEPTH_MIN 0.15
#define RICHTER_EDGE_NOISE 0.012
#define RICHTER_GRIP_NOISE 0.5
#define RICHTER_DEPOSIT 0.26
#define RICHTER_DRAG_DEPOSIT 0.3
#define RICHTER_CHROMA 0.5
#define RICHTER_CHROMA_BOOST 1.1
float bk(vec2 F){return 1.0-smoothstep(0.1,0.5,texture2D(u_depthTex,F).r);}vec4 bz(vec4 v){return vec4(v.xy*2.0-1.0,v.z,v.w*2.0-1.0);}vec4 a2(vec4 v){return vec4(saturate(v.xy*0.5+0.5),saturate(v.z),saturate(v.w*0.5+0.5));}
#define RAYLEIGHTAYLOR_SAMPLER_FNC(TEX, UV) bz(sampleClamp2edge(TEX,UV,u_resolution))
#include "lygia/simulate/rayleighTaylor.glsl"
#define FLUIDSOLVER_FNC(T, S, P, V) rayleighTaylor(T,S,P,V*RICHTER_FLUID_FORCE)
#include "lygia/color/mixSpectral.glsl"
#define DISPLACE_FNC(A,B,C) mixSpectral(A,B,C)
vec4 bA(sampler2D tex,vec2 F){vec2 vel=sampleClamp2edge(tex,F,u_resolution).xy*2.0-1.0;return vec4(vel,0.0,1.0)*bk(F)*RICHTER_FLUID_SLOW;}
#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) bA(TEX,UV)
#define DISPLACE_FROM_CONDITION (sourceVal.a>=currVal.a)
#define DISPLACE_TO_AMOUNT 1.0-(currVel.w*0.5+0.5)
#include "lygia/distort/displace.glsl"
vec2 bj(float r){return r<0.5?vec2(1.0,0.0):vec2(0.0,1.0);}float a3(int k,vec2 st,out vec2 dir,out float Z){dir=vec2(0.0);Z=1.0;float I=float(k);float bh=mix(RICHTER_PERIOD_MIN,RICHTER_PERIOD_MAX,random(vec2(I,1.31)));float a8=u_time/bh+random(vec2(I,7.7));float H=floor(a8);float f=fract(a8);if(f>RICHTER_DUTY)return 0.0;f/=RICHTER_DUTY;vec2 ad=vec2(H,I*13.0);vec2 Y=bj(random(ad+0.1));vec2 ao=Y.yx;float ab=mix(0.25,1.0,random(ad+0.2));float aD=mix(0.08,0.7,pow(random(ad+0.3),1.5));vec2 aA=Y*ab+ao*aD;vec2 aV=vec2(random(ad+0.4),random(ad+0.5))*(1.0-aA);float bo=dot(aV+aA*0.5-0.5,Y);dir=Y*(bo<0.0?-1.0:1.0);vec2 aZ=(st-aV)/aA;float a=dot(aZ,Y);float c=dot(aZ,ao);float aX=dot(st,Y)*9.0;float az=dot(st,ao)*9.0;float J=RICHTER_EDGE_NOISE;if(c<snoise(vec2(aX,H+I*5.0))*J/aD||c>1.0+snoise(vec2(aX,H+I*5.0+3.7))*J/aD||a<snoise(vec2(az,H+I*5.0+7.1))*J/ab||a>1.0+snoise(vec2(az,H+I*5.0+9.3))*J/ab)return 0.0;float s=(dir.x+dir.y<0.0)?1.0-a:a;float aT=smoothstep(0.0,1.0,f)+snoise(vec2(az*2.0,H+I*5.0+11.0))*J*2.0/ab+(random(gl_FragCoord.xy+H)-0.5)*0.004/ab;if(s>aT)return 0.0;Z=(aT-s)*ab;float ar=dot(gl_FragCoord.xy,Y);float aG=dot(gl_FragCoord.xy,ao)+RICHTER_BAND_WAVE*snoise(vec2(ar*RICHTER_BAND_FREQ,H+I*5.0+2.0))+0.25*RICHTER_BAND_WAVE*snoise(vec2(ar*RICHTER_BAND_FREQ*5.0,H+I*5.0+4.0));float ba=RICHTER_BAND_PX*mix(1.0,4.0,random(ad+0.6));float aJ=floor(aG/ba);float au=random(vec2(aJ,H+I*3.1));au*=1.0+RICHTER_GRIP_NOISE*snoise(vec2(aG*0.08,ar*0.02+H));au*=0.9+0.2*random(gl_FragCoord.xy*0.37+H);float O=RICHTER_SPEED*mix(0.3,1.4,au);O*=step(RICHTER_SKIP,random(vec2(aJ*0.37,H+I)));if(O<0.25)return 0.0;return O;}void main(void){vec4 o=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;float t=u_time*0.25;
#if defined(DOUBLE_BUFFER_0)
vec2 F=ratio(st,u_resolution);vec2 ai=vec2(0.0);float aU=u_time*RICHTER_FLUID_TIME;ai.x=fbm(F*(RICHTER_FLUID_SCALE+2.0)-0.2*aU);ai.y=fbm(F*(RICHTER_FLUID_SCALE+3.0)+0.23*aU);if(u_frame<2){o=a2(rayleighTaylorInit(u_backgroundTex,st));}else{o=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,ai);o=a2(o);}
#elif defined(DOUBLE_BUFFER_1)
o=texture2D(u_backgroundTex,st);vec4 ac=texture2D(u_scene,st);o=mix(o,ac,ac.a);if(u_frame>=2){float ak=1.0-texture2D(u_doubleBuffer2,st).r;o=mix(displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel),texture2D(u_doubleBuffer1,st),ak);for(int k=0;k<RICHTER_LAYERS;k++){vec2 dir;float Z;float O=a3(k,st,dir,Z);if(O<=0.0)continue;vec4 bi=texture2D(u_doubleBuffer1,st-dir*O*pixel);vec4 bp=texture2D(u_doubleBuffer1,st-dir*O*2.0*pixel);o=DISPLACE_FNC(bi,bp,RICHTER_SMEAR);}float as=u_cameraDrag?RICHTER_DRAG_DEPOSIT:RICHTER_DEPOSIT;vec3 ag=srgb2oklab(o.rgb);vec3 a5=srgb2oklab(ac.rgb);ag.x=mix(ag.x,a5.x,ac.a*as);ag.yz=mix(ag.yz,a5.yz*RICHTER_CHROMA_BOOST,ac.a*max(as,RICHTER_CHROMA));o.rgb=saturate(oklab2srgb(ag));o.a=mix(o.a,1.0,ac.a*as);}
#elif defined(DOUBLE_BUFFER_2)
float ak=0.0;for(int k=0;k<RICHTER_LAYERS;k++){vec2 dir;float Z;float O=a3(k,st,dir,Z);if(O>0.0)ak=max(ak,1.0-smoothstep(0.0,RICHTER_WET_REACH,Z));}float aw=(u_frame<2)?0.0:max(texture2D(u_doubleBuffer2,st).r-RICHTER_DRYING,0.0);aw=max(aw,ak);o=vec4(vec3(aw),1.0);
#elif defined(POSTPROCESSING)
o=texture2D(u_backgroundTex,st);vec4 aY=texture2D(u_doubleBuffer1,st);o.rgb=mix(o.rgb,aY.rgb,saturate(aY.a));o.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 aB=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 bx=v_texcoord.xy;vec4 af=a4(v_uv);vec4 be=a4(aB);float bf=(af.r*255.0*255.0+af.g*255.0+af.b*255.0)/(255.0*255.0);if(af.a>=.5&&!bm(af,be))discard;vec4 tex=bn(u_alignedTex,aB);o.rgb=tex.rgb;float l=pow(luma(tex.rgb),10.);o.a=step(0.5,l+(bx.x)*0.5+fract(bf+t-aB.y));
#else
o=v_color;
#endif
gl_FragColor=o;}
