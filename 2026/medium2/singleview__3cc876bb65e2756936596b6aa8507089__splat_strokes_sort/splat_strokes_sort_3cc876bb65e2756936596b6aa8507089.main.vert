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
#define SPLAT_SCALE 2.
#define UV_FILL 0.5
#include "lygia/math/toMat3.glsl"
vec3 aR(vec2 f){vec3 B=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float l=max(-B.z,0.0);B.x+=B.x>=0.0?-l:l;B.y+=B.y>=0.0?-l:l;return normalize(B);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 s(float j,float a4){vec2 J=vec2((a4+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(j+0.5)/STROKES_ATLAS_VIEWS);vec4 A=floor(texture2D(u_strokesAtlasCamTex,J)*255.0+0.5);vec2 aS=vec2(A.r*256.0+A.g,A.b*256.0+A.a)/65535.0;return(aS*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aH(float j,out vec3 F,out vec3 G,out vec3 H,out vec3 l,out vec4 C,out vec4 I){vec2 a=s(j,0.0);vec2 b=s(j,1.0);vec2 A=s(j,2.0);vec2 u=s(j,3.0);vec2 P=s(j,4.0);vec2 f=s(j,5.0);F=vec3(a.x,a.y,b.x);G=vec3(b.y,A.x,A.y);H=vec3(u.x,u.y,P.x);l=vec3(P.y,f.x,f.y);C=vec4(s(j,6.0),s(j,7.0));I=vec4(s(j,8.0),s(j,9.0));}float a2(vec2 h){vec2 av=floor(clamp(h,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return av.y*STROKES_ATLAS_COLS+av.x;}vec2 aI(vec3 F,vec3 G,vec3 H,vec3 l,vec4 C,vec3 w){vec3 A=vec3(dot(F,w),dot(G,w),dot(H,w))+l;return C.xy*A.xy/A.z+C.zw;}vec2 a3(vec2 a5,vec3 L,vec3 O){vec3 F,G,H,l;vec4 C,I;aH(a2(a5),F,G,H,l,C,I);vec2 u=(aI(F,G,H,l,C,O)-aI(F,G,H,l,C,L))*I.zw;return vec2(-u.x,u.y);}vec3 a1(float j){vec2 a=s(j,0.0);vec2 b=s(j,1.0);vec2 A=s(j,2.0);vec2 u=s(j,3.0);vec2 P=s(j,4.0);vec2 f=s(j,5.0);vec3 l=vec3(P.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*l.x+vec3(b.y,A.x,A.y)*l.y+vec3(u.x,u.y,P.x)*l.z);}float a8(vec3 aO,out float ac){float at=0.0;ac=1e20;for(int o=0;o<STROKES_ATLAS_MAX_VIEWS;o++){if(float(o)>=STROKES_ATLAS_VIEWS)break;float u=length(a1(float(o))-aO);if(u<ac){ac=u;at=float(o);}}return at;}vec2 a9(float j,vec2 J){vec3 F,G,H,l;vec4 C,I;aH(j,F,G,H,l,C,I);return I.xy+vec2(J.x,1.0-J.y)*I.zw;}
#endif
#endif
void main(){
#ifdef MODEL_PRIMITIVE_GSPLATS
float ab=u_gsplatTexResolution.x;float aP=u_gsplatTexResolution.y;float aB=a_index;float aT=floor(aB/1024.0);float U=mod(aB,1024.0)*4.0;float v=(aT+0.5)/aP;vec4 V=texture2D(u_gsplatTex,vec2((U+0.5)/ab,v));v_position=vec4(V.xyz,1.0);vec4 au=u_viewMatrix*u_modelMatrix*v_position;vec4 Y=u_projectionMatrix*au;vec4 M=texture2D(u_gsplatTex,vec2((U+1.5)/ab,v));vec4 W=texture2D(u_gsplatTex,vec2((U+2.5)/ab,v));vec4 X=texture2D(u_gsplatTex,vec2((U+3.5)/ab,v));float u_hi=floor(X.r*255.0+0.5);float u_lo=floor(X.g*255.0+0.5);float v_hi=floor(X.b*255.0+0.5);float v_lo=floor(X.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 an=mat3(M.x,M.y,M.z,M.y,M.w,W.x,M.z,W.x,W.y);vec3 B=aR(W.zw);v_normal=normalize(toMat3(u_viewMatrix*u_modelMatrix)*B);if(dot(v_normal,au.xyz)>0.0)v_normal=-v_normal;vec3 N=normalize(cross((abs(B.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),B));vec3 Z=cross(B,N);vec3 aM=an*N;vec3 ao=an*Z;float T=dot(N,aM),cb=dot(N,ao),cd=dot(Z,ao);float aA=T-cd;float phi=(abs(cb)<1e-9&&abs(aA)<1e-9)?0.0:0.5*atan(2.0*cb,aA);float aw=0.5*(T+cd);float az=sqrt(max(0.25*(T-cd)*(T-cd)+cb*cb,0.0));float aU=UV_FILL*sqrt(max(aw+az,0.0));float aV=UV_FILL*sqrt(max(aw-az,0.0));vec3 ar=aU*(cos(phi)*N+sin(phi)*Z);vec3 as=aV*(-sin(phi)*N+cos(phi)*Z);vec2 aC=u_focal/u_resolution;vec3 L=V.xyz;vec3 O=L+a_position.x*ar+a_position.y*as;vec2 a6=aC*vec2(L.x,-L.y)/(-L.z)+0.5;vec2 a7=aC*vec2(O.x,-O.y)/(-O.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=a3(v_uv,L,O);
#else
v_uvStep=a7-a6;
#endif
v_texcoord=a_position;vec2 am=Y.xy/Y.w;vec4 ax=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(V.xyz+ar,1.0);vec4 ay=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(V.xyz+as,1.0);vec2 af=ax.xy/ax.w-am;vec2 ag=ay.xy/ay.w-am;float aE=2.0/max(u_resolution.x,u_resolution.y);float ae=length(af),l2n=length(ag);if(ae>1e-8)af*=max(ae,aE)/ae;if(l2n>1e-8)ag*=max(l2n,aE)/l2n;v_position=vec4((a_position.x*af+a_position.y*ag),Y.z/Y.w,1.0);float aZ=SPLAT_SCALE;float l=u_time*0.25;v_position.xy=am+aZ*v_position.xy;gl_Position=v_position;
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
v_uv=v_texcoord;v_uvStep=vec2(0.0);gl_PointSize=10.0;gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#if defined(SCENE_BUFFER_NORMAL)
gl_Position=vec4(0.0);gl_PointSize=0.0;
#endif
#endif
}
