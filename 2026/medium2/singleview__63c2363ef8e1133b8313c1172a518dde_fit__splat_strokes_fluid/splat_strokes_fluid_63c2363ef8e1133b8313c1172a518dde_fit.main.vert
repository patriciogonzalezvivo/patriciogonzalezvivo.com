// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_gsplatTex;uniform vec2 u_gsplatTexResolution;uniform mat4 u_projectionMatrix;uniform mat4 u_viewMatrix;uniform mat4 u_modelMatrix;uniform vec2 u_resolution;uniform vec2 u_focal;uniform float u_time;
#ifdef MODEL_PRIMITIVE_GSPLATS
attribute vec2 a_position;attribute float a_index;
#else
attribute vec4 a_position;
#ifdef MODEL_VERTEX_COLOR
attribute vec4 a_color;
#endif
#ifdef MODEL_VERTEX_NORMAL
attribute vec3 a_normal;
#endif
#ifdef MODEL_VERTEX_TEXCOORD
attribute vec2 a_texcoord;
#endif
#endif
varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
#include "lygia/math/toMat3.glsl"
#if defined(SCENE_BUFFER_NORMAL)
#define SPLAT_SCALE 1.5
#else
#define SPLAT_SCALE .75
#endif
#define UV_FILL 0.5
vec3 aK(vec2 f){vec3 G=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float A=max(-G.z,0.0);G.x+=G.x>=0.0?-A:A;G.y+=G.y>=0.0?-A:A;return normalize(G);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 E(float o,float aR){vec2 st=vec2((aR+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(o+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 M=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(M*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aB(float o,out vec3 I,out vec3 J,out vec3 L,out vec3 A,out vec4 H,out vec4 N){vec2 a=E(o,0.0);vec2 b=E(o,1.0);vec2 c=E(o,2.0);vec2 d=E(o,3.0);vec2 U=E(o,4.0);vec2 f=E(o,5.0);I=vec3(a.x,a.y,b.x);J=vec3(b.y,c.x,c.y);L=vec3(d.x,d.y,U.x);A=vec3(U.y,f.x,f.y);H=vec4(E(o,6.0),E(o,7.0));N=vec4(E(o,8.0),E(o,9.0));}float aP(vec2 F){vec2 aq=floor(clamp(F,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return aq.y*STROKES_ATLAS_COLS+aq.x;}vec2 aC(vec3 I,vec3 J,vec3 L,vec3 A,vec4 H,vec3 w){vec3 c=vec3(dot(I,w),dot(J,w),dot(L,w))+A;return H.xy*c.xy/c.z+H.zw;}vec2 aQ(vec2 aS,vec3 O,vec3 R){vec3 I,J,L,A;vec4 H,N;aB(aP(aS),I,J,L,A,H,N);vec2 d=(aC(I,J,L,A,H,R)-aC(I,J,L,A,H,O))*N.zw;return vec2(-d.x,d.y);}vec3 aO(float o){vec2 a=E(o,0.0);vec2 b=E(o,1.0);vec2 c=E(o,2.0);vec2 d=E(o,3.0);vec2 U=E(o,4.0);vec2 f=E(o,5.0);vec3 A=vec3(U.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*A.x+vec3(b.y,c.x,c.y)*A.y+vec3(d.x,d.y,U.x)*A.z);}float aV(vec3 aH,out float af){float ao=0.0;af=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aO(float(i))-aH);if(d<af){af=d;ao=float(i);}}return ao;}vec2 aW(float o,vec2 st){vec3 I,J,L,A;vec4 H,N;aB(o,I,J,L,A,H,N);return N.xy+vec2(st.x,1.0-st.y)*N.zw;}
#endif
#endif
void main(){
#ifdef MODEL_PRIMITIVE_GSPLATS
float ae=u_gsplatTexResolution.x;float aI=u_gsplatTexResolution.y;float aw=a_index;float aL=floor(aw/1024.0);float Y=mod(aw,1024.0)*4.0;float v=(aL+0.5)/aI;vec4 p1=texture2D(u_gsplatTex,vec2((Y+0.5)/ae,v));v_position=vec4(p1.xyz,1.0);vec4 ap=u_viewMatrix*u_modelMatrix*v_position;vec4 ab=u_projectionMatrix*ap;vec4 p2=texture2D(u_gsplatTex,vec2((Y+1.5)/ae,v));vec4 p3=texture2D(u_gsplatTex,vec2((Y+2.5)/ae,v));vec4 p4=texture2D(u_gsplatTex,vec2((Y+3.5)/ae,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 ak=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 G=aK(p3.zw);v_normal=normalize(toMat3(u_viewMatrix*u_modelMatrix)*G);if(dot(v_normal,ap.xyz)>0.0)v_normal=-v_normal;vec3 Q=normalize(cross((abs(G.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),G));vec3 ad=cross(G,Q);vec3 aF=ak*Q;vec3 al=ak*ad;float X=dot(Q,aF),cb=dot(Q,al),cd=dot(ad,al);float av=X-cd;float aa=(abs(cb)<1e-9&&abs(av)<1e-9)?0.0:0.5*atan(2.0*cb,av);float ar=0.5*(X+cd);float au=sqrt(max(0.25*(X-cd)*(X-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(ar+au,0.0));float s2=UV_FILL*sqrt(max(ar-au,0.0));vec3 am=s1*(cos(aa)*Q+sin(aa)*ad);vec3 an=s2*(-sin(aa)*Q+cos(aa)*ad);vec2 ax=u_focal/u_resolution;vec3 O=p1.xyz;vec3 R=O+a_position.x*am+a_position.y*an;vec2 aT=ax*vec2(O.x,-O.y)/(-O.z)+0.5;vec2 aU=ax*vec2(R.x,-R.y)/(-R.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aQ(v_uv,O,R);
#else
v_uvStep=aU-aT;
#endif
v_texcoord=a_position;vec2 aj=ab.xy/ab.w;vec4 as=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+am,1.0);vec4 at=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+an,1.0);vec2 ah=as.xy/as.w-aj;vec2 ai=at.xy/at.w-aj;float az=2.0/max(u_resolution.x,u_resolution.y);float ag=length(ah),l2n=length(ai);if(ag>1e-8)ah*=max(ag,az)/ag;if(l2n>1e-8)ai*=max(l2n,az)/l2n;v_position=vec4((a_position.x*ah+a_position.y*ai),ab.z/ab.w,1.0);float ac=SPLAT_SCALE;
#if !defined(SCENE_BUFFER_NORMAL)
float W=1.0-dot(v_normal,vec3(0.0,0.0,1.0));ac*=(1.0-W);ac=mix(ac,1.2,W);
#endif
float A=u_time*0.25;v_position.xy=aj+ac*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=vec4(u_modelMatrix*vec4(a_normal,0.0)).xyz;
#endif
v_color=vec4(0.8,0.8,0.8,1.0);
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);gl_PointSize=2.0;gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#if defined(SCENE_BUFFER_NORMAL)
gl_Position=vec4(0.0);gl_PointSize=0.0;
#endif
#endif
}
