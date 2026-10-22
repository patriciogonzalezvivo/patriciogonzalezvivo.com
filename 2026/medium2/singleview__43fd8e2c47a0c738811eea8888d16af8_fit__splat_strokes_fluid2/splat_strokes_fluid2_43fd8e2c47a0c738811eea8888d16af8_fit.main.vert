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
vec3 aN(vec2 f){vec3 H=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float A=max(-H.z,0.0);H.x+=H.x>=0.0?-A:A;H.y+=H.y>=0.0?-A:A;return normalize(H);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 F(float o,float aU){vec2 st=vec2((aU+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(o+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 O=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(O*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aE(float o,out vec3 J,out vec3 M,out vec3 N,out vec3 A,out vec4 I,out vec4 Q){vec2 a=F(o,0.0);vec2 b=F(o,1.0);vec2 c=F(o,2.0);vec2 d=F(o,3.0);vec2 Y=F(o,4.0);vec2 f=F(o,5.0);J=vec3(a.x,a.y,b.x);M=vec3(b.y,c.x,c.y);N=vec3(d.x,d.y,Y.x);A=vec3(Y.y,f.x,f.y);I=vec4(F(o,6.0),F(o,7.0));Q=vec4(F(o,8.0),F(o,9.0));}float aS(vec2 G){vec2 at=floor(clamp(G,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return at.y*STROKES_ATLAS_COLS+at.x;}vec2 aF(vec3 J,vec3 M,vec3 N,vec3 A,vec4 I,vec3 w){vec3 c=vec3(dot(J,w),dot(M,w),dot(N,w))+A;return I.xy*c.xy/c.z+I.zw;}vec2 aT(vec2 aV,vec3 U,vec3 X){vec3 J,M,N,A;vec4 I,Q;aE(aS(aV),J,M,N,A,I,Q);vec2 d=(aF(J,M,N,A,I,X)-aF(J,M,N,A,I,U))*Q.zw;return vec2(-d.x,d.y);}vec3 aR(float o){vec2 a=F(o,0.0);vec2 b=F(o,1.0);vec2 c=F(o,2.0);vec2 d=F(o,3.0);vec2 Y=F(o,4.0);vec2 f=F(o,5.0);vec3 A=vec3(Y.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*A.x+vec3(b.y,c.x,c.y)*A.y+vec3(d.x,d.y,Y.x)*A.z);}float aY(vec3 aK,out float ai){float ar=0.0;ai=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aR(float(i))-aK);if(d<ai){ai=d;ar=float(i);}}return ar;}vec2 aZ(float o,vec2 st){vec3 J,M,N,A;vec4 I,Q;aE(o,J,M,N,A,I,Q);return Q.xy+vec2(st.x,1.0-st.y)*Q.zw;}
#endif
#endif
void main(){
#ifdef MODEL_PRIMITIVE_GSPLATS
float ah=u_gsplatTexResolution.x;float aL=u_gsplatTexResolution.y;float az=a_index;float aO=floor(az/1024.0);float ab=mod(az,1024.0)*4.0;float v=(aO+0.5)/aL;vec4 p1=texture2D(u_gsplatTex,vec2((ab+0.5)/ah,v));v_position=vec4(p1.xyz,1.0);vec4 as=u_viewMatrix*u_modelMatrix*v_position;vec4 ae=u_projectionMatrix*as;vec4 p2=texture2D(u_gsplatTex,vec2((ab+1.5)/ah,v));vec4 p3=texture2D(u_gsplatTex,vec2((ab+2.5)/ah,v));vec4 p4=texture2D(u_gsplatTex,vec2((ab+3.5)/ah,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 an=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 H=aN(p3.zw);v_normal=normalize(toMat3(u_viewMatrix*u_modelMatrix)*H);if(dot(v_normal,as.xyz)>0.0)v_normal=-v_normal;vec3 W=normalize(cross((abs(H.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),H));vec3 ag=cross(H,W);vec3 aI=an*W;vec3 ao=an*ag;float aa=dot(W,aI),cb=dot(W,ao),cd=dot(ag,ao);float ay=aa-cd;float ad=(abs(cb)<1e-9&&abs(ay)<1e-9)?0.0:0.5*atan(2.0*cb,ay);float au=0.5*(aa+cd);float ax=sqrt(max(0.25*(aa-cd)*(aa-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(au+ax,0.0));float s2=UV_FILL*sqrt(max(au-ax,0.0));vec3 ap=s1*(cos(ad)*W+sin(ad)*ag);vec3 aq=s2*(-sin(ad)*W+cos(ad)*ag);vec2 aA=u_focal/u_resolution;vec3 U=p1.xyz;vec3 X=U+a_position.x*ap+a_position.y*aq;vec2 aW=aA*vec2(U.x,-U.y)/(-U.z)+0.5;vec2 aX=aA*vec2(X.x,-X.y)/(-X.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aT(v_uv,U,X);
#else
v_uvStep=aX-aW;
#endif
v_texcoord=a_position;vec2 am=ae.xy/ae.w;vec4 av=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ap,1.0);vec4 aw=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aq,1.0);vec2 ak=av.xy/av.w-am;vec2 al=aw.xy/aw.w-am;float aC=2.0/max(u_resolution.x,u_resolution.y);float aj=length(ak),l2n=length(al);if(aj>1e-8)ak*=max(aj,aC)/aj;if(l2n>1e-8)al*=max(l2n,aC)/l2n;v_position=vec4((a_position.x*ak+a_position.y*al),ae.z/ae.w,1.0);float af=SPLAT_SCALE;
#if !defined(SCENE_BUFFER_NORMAL)
float Z=1.0-dot(v_normal,vec3(0.0,0.0,1.0));af*=(1.0-Z);af=mix(af,1.2,Z);
#endif
float A=u_time*0.25;v_position.xy=am+af*v_position.xy;gl_Position=v_position;
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
