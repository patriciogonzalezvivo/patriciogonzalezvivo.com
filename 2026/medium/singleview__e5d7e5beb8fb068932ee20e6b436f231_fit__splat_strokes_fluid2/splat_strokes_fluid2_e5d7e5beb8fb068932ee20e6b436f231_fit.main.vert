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
#define SPLAT_SCALE 0.75
#else
#define SPLAT_SCALE 0.75
#endif
#define UV_FILL 0.5
#define SPLAT_NORMAL_SIGN -1.0
#define SPLAT_BACKFACE_CULL 0.0
#define SPLAT_NEAR_DIST 0.9
#define SPLAT_NEAR_POWER 0.25
#define SPLAT_NEAR_MAX 1.0
vec3 a2(vec2 f){vec3 J=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float t=max(-J.z,0.0);J.x+=J.x>=0.0?-t:t;J.y+=J.y>=0.0?-t:t;return normalize(J);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 G(float E,float bb){vec2 st=vec2((bb+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(E+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 N=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(N*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aK(float E,out vec3 O,out vec3 Q,out vec3 U,out vec3 t,out vec4 M,out vec4 W){vec2 a=G(E,0.0);vec2 b=G(E,1.0);vec2 c=G(E,2.0);vec2 d=G(E,3.0);vec2 aa=G(E,4.0);vec2 f=G(E,5.0);O=vec3(a.x,a.y,b.x);Q=vec3(b.y,c.x,c.y);U=vec3(d.x,d.y,aa.x);t=vec3(aa.y,f.x,f.y);M=vec4(G(E,6.0),G(E,7.0));W=vec4(G(E,8.0),G(E,9.0));}float a_(vec2 o){vec2 aw=floor(clamp(o,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return aw.y*STROKES_ATLAS_COLS+aw.x;}vec2 aL(vec3 O,vec3 Q,vec3 U,vec3 t,vec4 M,vec3 w){vec3 c=vec3(dot(O,w),dot(Q,w),dot(U,w))+t;return M.xy*c.xy/c.z+M.zw;}vec2 ba(vec2 bc,vec3 X,vec3 Z){vec3 O,Q,U,t;vec4 M,W;aK(a_(bc),O,Q,U,t,M,W);vec2 d=(aL(O,Q,U,t,M,Z)-aL(O,Q,U,t,M,X))*W.zw;return vec2(-d.x,d.y);}vec3 a9(float E){vec2 a=G(E,0.0);vec2 b=G(E,1.0);vec2 c=G(E,2.0);vec2 d=G(E,3.0);vec2 aa=G(E,4.0);vec2 f=G(E,5.0);vec3 t=vec3(aa.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*t.x+vec3(b.y,c.x,c.y)*t.y+vec3(d.x,d.y,aa.x)*t.z);}float bg(vec3 aT,out float am){float av=0.0;am=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(a9(float(i))-aT);if(d<am){am=d;av=float(i);}}return av;}vec2 bh(float E,vec2 st){vec3 O,Q,U,t;vec4 M,W;aK(E,O,Q,U,t,M,W);return W.xy+vec2(st.x,1.0-st.y)*W.zw;}
#endif
#endif
void main(){
#ifdef MODEL_PRIMITIVE_GSPLATS
float al=u_gsplatTexResolution.x;float aV=u_gsplatTexResolution.y;float aC=a_index;float a4=floor(aC/1024.0);float ag=mod(aC,1024.0)*4.0;float v=(a4+0.5)/aV;vec4 p1=texture2D(u_gsplatTex,vec2((ag+0.5)/al,v));v_position=vec4(p1.xyz,1.0);vec4 ae=u_viewMatrix*u_modelMatrix*v_position;vec4 I=u_projectionMatrix*ae;float af=1.5*I.w;if(I.z<-I.w||I.z>I.w||I.x<-af||I.x>af||I.y<-af||I.y>af){gl_Position=vec4(0.0,0.0,2.0,1.0);return;}vec4 p2=texture2D(u_gsplatTex,vec2((ag+1.5)/al,v));vec4 p3=texture2D(u_gsplatTex,vec2((ag+2.5)/al,v));vec4 p4=texture2D(u_gsplatTex,vec2((ag+3.5)/al,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 ar=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 J=a2(p3.zw);v_normal=normalize(toMat3(u_viewMatrix*u_modelMatrix)*J);if(dot(SPLAT_NORMAL_SIGN*v_normal,normalize(ae.xyz))>SPLAT_BACKFACE_CULL){gl_Position=vec4(0.0,0.0,2.0,1.0);return;}if(dot(v_normal,ae.xyz)>0.0)v_normal=-v_normal;vec3 t1=normalize(cross((abs(J.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),J));vec3 t2=cross(J,t1);vec3 aP=ar*t1;vec3 as=ar*t2;float ad=dot(t1,aP),cb=dot(t1,as),cd=dot(t2,as);float aB=ad-cd;float aj=(abs(cb)<1e-9&&abs(aB)<1e-9)?0.0:0.5*atan(2.0*cb,aB);float ax=0.5*(ad+cd);float aA=sqrt(max(0.25*(ad-cd)*(ad-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(ax+aA,0.0));float s2=UV_FILL*sqrt(max(ax-aA,0.0));vec3 at=s1*(cos(aj)*t1+sin(aj)*t2);vec3 au=s2*(-sin(aj)*t1+cos(aj)*t2);vec2 aD=u_focal/u_resolution;vec3 X=p1.xyz;vec3 Z=X+a_position.x*at+a_position.y*au;vec2 bd=aD*vec2(X.x,-X.y)/(-X.z)+0.5;vec2 be=aD*vec2(Z.x,-Z.y)/(-Z.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=ba(v_uv,X,Z);
#else
v_uvStep=be-bd;
#endif
v_texcoord=a_position;vec2 aq=I.xy/I.w;vec4 ay=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+at,1.0);vec4 az=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+au,1.0);vec2 ao=ay.xy/ay.w-aq;vec2 ap=az.xy/az.w-aq;float aH=2.0/max(u_resolution.x,u_resolution.y);float an=length(ao),l2n=length(ap);if(an>1e-8)ao*=max(an,aH)/an;if(l2n>1e-8)ap*=max(l2n,aH)/l2n;v_position=vec4((a_position.x*ao+a_position.y*ap),I.z/I.w,1.0);float ab=SPLAT_SCALE;
#if !defined(SCENE_BUFFER_NORMAL)
float ac=1.0-dot(v_normal,vec3(0.0,0.0,1.0));ab*=(1.0-ac);ab=mix(ab,1.2,ac);
#endif
float aR=max(-ae.z,1e-3);ab*=clamp(pow(SPLAT_NEAR_DIST/aR,SPLAT_NEAR_POWER),1.0,SPLAT_NEAR_MAX);float t=u_time*0.25;v_position.xy=aq+ab*v_position.xy;gl_Position=v_position;
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
