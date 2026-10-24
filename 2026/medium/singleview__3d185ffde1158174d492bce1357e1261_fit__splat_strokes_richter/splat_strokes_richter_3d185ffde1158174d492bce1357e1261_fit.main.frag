// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_depthTex;uniform sampler2D u_doubleBuffer0;uniform sampler2D u_doubleBuffer1;uniform sampler2D u_scene;uniform vec3 u_camera;uniform vec3 u_cameraTrg;uniform bool u_cameraDrag;uniform vec2 u_resolution;uniform float u_time;uniform int u_frame;uniform vec3 u_light;uniform vec3 u_lightColor;uniform float u_lightFalloff;uniform float u_lightIntensity;uniform float u_iblLuminance;uniform samplerCube u_cubeMap;uniform vec3 u_SH[9];varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
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
vec2 aX(vec2 G){
#if MAP_FLIP_Y
G.y=1.0-G.y;
#endif
#if MAP_WRAP
G=fract(G);
#endif
return G;}vec4 bf(sampler2D tex,vec2 G){return texture2D(tex,aX(G));}vec4 aT(vec2 G){vec2 g=aX(G);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool be(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
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
#define RICHTER_LAYERS 3
#define RICHTER_PERIOD_MIN 2.0
#define RICHTER_PERIOD_MAX 5.0
#define RICHTER_DUTY 0.6
#define RICHTER_SPEED 6.0
#define RICHTER_BAND_PX 1.5
#define RICHTER_BAND_WAVE 7.0
#define RICHTER_BAND_FREQ 0.012
#define RICHTER_SKIP 0.15
#define RICHTER_SMEAR 0.25
#define RICHTER_FLUID_FORCE 30.0
#define RICHTER_FLUID_SLOW 0.5
#define RICHTER_FLUID_TIME 0.1
#define RICHTER_FLUID_SCALE 4.0
#define RICHTER_DEPTH_MIN 0.15
#define RICHTER_EDGE_NOISE 0.012
#define RICHTER_GRIP_NOISE 0.5
#define RICHTER_DEPOSIT 0.06
#define RICHTER_DRAG_DEPOSIT 0.3
float br(vec2 G){return 1.0-smoothstep(0.1,0.5,texture2D(u_depthTex,G).r);}
#define LATTICEBOLTZMANN_BOUNDARY
#define LATTICEBOLTZMANN_SAMPLER_FNC(TEX, UV) (sampleClamp2edge(TEX,UV,u_resolution)*2.0-1.0)
#include "lygia/simulate/latticeBoltzmann.glsl"
#define FLUIDSOLVER_FNC(T, S, P, V) latticeBoltzmann(T,S,P,V*RICHTER_FLUID_FORCE)
#include "lygia/color/mixSpectral.glsl"
#define DISPLACE_FNC(A,B,C) mixSpectral(A,B,C)
#define DISPLACE_VEL_SAMPLER_FNC(TEX, UV) ((sampleClamp2edge(TEX,UV,u_resolution)*2.0-1.0)*br(UV)*RICHTER_FLUID_SLOW)
#define DISPLACE_FROM_CONDITION (sourceVal.a>=currVal.a)
#define DISPLACE_TO_AMOUNT 1.0-(currVel.w*0.5+0.5)
#define DISPLACE_DIRECTIONS 16
#include "lygia/distort/displace.glsl"
vec2 bc(float r){return r<0.5?vec2(1.0,0.0):vec2(0.0,1.0);}void main(void){vec4 E=vec4(vec3(0.0),1.0);vec2 pixel=1.0/u_resolution.xy;vec2 st=gl_FragCoord.xy*pixel;float t=u_time*0.25;
#if defined(DOUBLE_BUFFER_0)
vec2 G=ratio(st,u_resolution);vec2 ad=vec2(0.0);float aN=u_time*RICHTER_FLUID_TIME;ad.x=fbm(G*(RICHTER_FLUID_SCALE+2.0)-0.2*aN);ad.y=fbm(G*(RICHTER_FLUID_SCALE+3.0)+0.23*aN);E=FLUIDSOLVER_FNC(u_doubleBuffer0,st,pixel,ad);E.xy*=0.99;E.xy=saturate(E.xy*0.5+0.5);E.z=saturate(E.z);E.w=1.0;
#elif defined(DOUBLE_BUFFER_1)
vec4 at=texture2D(u_scene,st);if(u_frame<2){E=at;}else{E=displace(u_doubleBuffer0,u_doubleBuffer1,st,pixel);E.a=1.0;for(int k=0;k<RICHTER_LAYERS;k++){float I=float(k);float ba=mix(RICHTER_PERIOD_MIN,RICHTER_PERIOD_MAX,random(vec2(I,1.31)));float aW=u_time/ba+random(vec2(I,7.7));float H=floor(aW);float f=fract(aW);if(f>RICHTER_DUTY)continue;f/=RICHTER_DUTY;vec2 Y=vec2(H,I*13.0);vec2 W=bc(random(Y+0.1));vec2 aj=W.yx;float ab=mix(0.25,1.0,random(Y+0.2));float ax=mix(0.08,0.7,pow(random(Y+0.3),1.5));vec2 au=W*ab+aj*ax;vec2 aO=vec2(random(Y+0.4),random(Y+0.5))*(1.0-au);float bg=dot(aO+au*0.5-0.5,W);vec2 dir=W*(bg<0.0?-1.0:1.0);vec2 aS=(st-aO)/au;float a=dot(aS,W);float c=dot(aS,aj);float aQ=dot(st,W)*9.0;float as=dot(st,aj)*9.0;float J=RICHTER_EDGE_NOISE;if(c<snoise(vec2(aQ,H+I*5.0))*J/ax||c>1.0+snoise(vec2(aQ,H+I*5.0+3.7))*J/ax||a<snoise(vec2(as,H+I*5.0+7.1))*J/ab||a>1.0+snoise(vec2(as,H+I*5.0+9.3))*J/ab)continue;float s=(dir.x+dir.y<0.0)?1.0-a:a;float a6=smoothstep(0.0,1.0,f)+snoise(vec2(as*2.0,H+I*5.0+11.0))*J*2.0/ab+(random(gl_FragCoord.xy+H)-0.5)*0.004/ab;if(s>a6)continue;float am=dot(gl_FragCoord.xy,W);float aA=dot(gl_FragCoord.xy,aj)+RICHTER_BAND_WAVE*snoise(vec2(am*RICHTER_BAND_FREQ,H+I*5.0+2.0))+0.25*RICHTER_BAND_WAVE*snoise(vec2(am*RICHTER_BAND_FREQ*5.0,H+I*5.0+4.0));float aZ=RICHTER_BAND_PX*mix(1.0,4.0,random(Y+0.6));float aD=floor(aA/aZ);float ao=random(vec2(aD,H+I*3.1));ao*=1.0+RICHTER_GRIP_NOISE*snoise(vec2(aA*0.08,am*0.02+H));ao*=0.9+0.2*random(gl_FragCoord.xy*0.37+H);float a4=texture2D(u_depthTex,st).r;float af=RICHTER_SPEED*mix(0.3,1.4,ao)*mix(RICHTER_DEPTH_MIN,1.0,a4);af*=step(RICHTER_SKIP,random(vec2(aD*0.37,H+I)));if(af<0.25)continue;vec4 bb=texture2D(u_doubleBuffer1,st-dir*af*pixel);vec4 bh=texture2D(u_doubleBuffer1,st-dir*af*2.0*pixel);E=mix(bb,bh,RICHTER_SMEAR);}float a3=u_cameraDrag?RICHTER_DRAG_DEPOSIT:RICHTER_DEPOSIT;E=mix(E,vec4(at.rgb,1.0),at.a*a3);}
#elif defined(POSTPROCESSING)
vec4 aR=texture2D(u_doubleBuffer1,st);E.rgb=mix(E.rgb,aR.rgb,aR.a);E.a=1.0;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 av=v_uv+vec2(-v_uvStep.x,v_uvStep.y);vec2 bp=v_texcoord.xy;vec4 aa=aT(v_uv);vec4 a8=aT(av);float a9=(aa.r*255.0*255.0+aa.g*255.0+aa.b*255.0)/(255.0*255.0);if(aa.a>=.5&&!be(aa,a8))discard;vec4 tex=bf(u_alignedTex,av);E.rgb=tex.rgb;float l=pow(luma(tex.rgb),10.);E.a=step(0.5,l+(bp.x)*0.5+fract(a9+t-av.y));
#else
E=v_color;
#endif
gl_FragColor=E;}
