// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_buffer0;uniform sampler2D u_scene;uniform sampler2D u_alignedTex;uniform sampler2D u_strokeIndicesTex;uniform vec2 u_strokeIndicesTexResolution;uniform sampler2D u_cameraTex;uniform sampler2D u_cameraNextTex;uniform float u_cameraPct;uniform vec3 u_cameraTrg;uniform vec3 u_camera;uniform vec2 u_resolution;uniform float u_time;uniform vec3 u_light;uniform vec3 u_lightColor;uniform float u_lightFalloff;uniform float u_lightIntensity;uniform float u_iblLuminance;uniform samplerCube u_cubeMap;uniform vec3 u_SH[9];varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
#define SURFACE_POSITION v_position
#define CAMERA_POSITION u_camera
#define IBL_LUMINANCE u_iblLuminance
#define LIGHT_DIRECTION u_light
#define LIGHT_COLOR u_lightColor
#define LIGHT_FALLOFF u_lightFalloff
#define LIGHT_INTENSITY u_lightIntensity
#define ERROR 3.0
#define PIXEL_SIZE 2.0
#define MAX_STEPS 9999.0
#include "lygia/math/const.glsl"
#include "lygia/math/mirror.glsl"
#include "lygia/color/luma.glsl"
#include "lygia/space/decimateNormal.glsl"
vec2 aJ(vec2 h){h.y=1.0-h.y;return h;}vec4 aX(sampler2D S,vec2 h){return texture2D(S,aJ(h));}vec4 aG(vec2 h){vec2 g=aJ(h);if(u_strokeIndicesTexResolution.x>0.5)g=(floor(g*u_strokeIndicesTexResolution)+0.5)/u_strokeIndicesTexResolution;return texture2D(u_strokeIndicesTex,g);}bool aW(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 u=abs(a.rgb-b.rgb);return max(u.r,max(u.g,u.b))<=0.5/255.0;}vec2 a0(sampler2D S,vec2 h,vec2 E,float al){float g=luma(texture2D(S,h).rgb);if(g<al)return h;float ah=0.;vec2 ad=vec2(0.0);for(float o=0.;o<MAX_STEPS;o+=1.){vec2 k=h-E*o;if(k.x<0.||k.y<0.||k.x>=1.||k.y>=1.){ad=k;break;}float Q=luma(texture2D(S,k).rgb);if(Q<al){ad=k;break;}ah+=step(Q,g);}for(float o=0.;o<MAX_STEPS;o+=1.){vec2 k=h+E*o;if(k.x<0.||k.y<0.||k.x>=1.||k.y>=1.)break;float Q=luma(texture2D(S,k).rgb);if(Q<=al)break;ah+=step(Q+0.00001,g);}return ad+ah*E;;}vec4 aY(sampler2D aj,sampler2D ak,vec2 h,vec2 E,vec2 R){vec3 aN=texture2D(ak,h).rgb;float aF=ERROR*R.x;vec2 k=vec2(0.0);vec2 aa=vec2(0.0);for(float o=0.;o<MAX_STEPS;o++){{k=h-E*o;aa=texture2D(ak,k).xy;if(length(h-aa)<aF)return texture2D(aj,k);}{k=h+E*o;aa=texture2D(ak,k).xy;if(length(h-aa)<aF)return texture2D(aj,k);}}return texture2D(aj,aN.xy);}void main(void){vec4 D=vec4(vec3(0.0),1.0);vec2 R=1.0/u_resolution.xy;vec2 J=gl_FragCoord.xy*R;float ap=.5;float aq=PI*0.5;vec2 E=vec2(cos(aq),sin(aq))*R*PIXEL_SIZE;ap=0.1+mirror(u_time*0.25)*0.5;
#if defined(BUFFER_0)
D.xy=a0(u_scene,J,E,ap);
#elif defined(POSTPROCESSING)
vec4 ai=aY(u_scene,u_buffer0,J,E,R);ai.a=1.0;D=texture2D(u_scene,J);D=mix(ai,D,D.a);D=ai;
#elif defined(MODEL_PRIMITIVE_GSPLATS)
vec2 h=v_uv;vec2 aL=v_uvStep;vec2 aK=h+vec2(-aL.x,aL.y);vec4 aD=aG(h);vec4 aQ=aG(aK);if(aD.a>=.5&&!aW(aD,aQ))discard;D.rgb=aX(u_alignedTex,aK).rgb;
#else
D=v_color;
#endif
gl_FragColor=D;}
