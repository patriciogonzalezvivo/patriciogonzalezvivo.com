// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_gsplatTex;uniform vec2 u_gsplatTexResolution;uniform mat4 u_projectionMatrix;uniform mat4 u_viewMatrix;uniform mat4 u_modelMatrix;uniform mat3 u_normalMatrix;uniform vec4 u_color;uniform vec2 u_resolution;uniform vec2 u_focal;uniform float u_time;
#ifdef MODEL_PRIMITIVE_GSPLATS
attribute vec2 a_position;attribute float a_index;
#else
attribute vec4 a_position;
#ifdef MODEL_VERTEX_NORMAL
attribute vec3 a_normal;
#endif
#ifdef MODEL_VERTEX_TEXCOORD
attribute vec2 a_texcoord;
#endif
#ifdef MODEL_VERTEX_COLOR
attribute vec4 a_color;
#endif
#endif
varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
#define SPLAT_SCALE 1.
#define UV_FILL 0.55
vec3 a_(vec2 f){vec3 M=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float t=max(-M.z,0.0);M.x+=M.x>=0.0?-t:t;M.y+=M.y>=0.0?-t:t;return normalize(M);}
#include "lygia/color/luma.glsl"
#include "lygia/generative/snoise.glsl"
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 F(float o,float bl){vec2 st=vec2((bl+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(o+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 ad=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(ad*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aU(float o,out vec3 N,out vec3 O,out vec3 Q,out vec3 t,out vec4 L,out vec4 U){vec2 a=F(o,0.0);vec2 b=F(o,1.0);vec2 c=F(o,2.0);vec2 d=F(o,3.0);vec2 J=F(o,4.0);vec2 f=F(o,5.0);N=vec3(a.x,a.y,b.x);O=vec3(b.y,c.x,c.y);Q=vec3(d.x,d.y,J.x);t=vec3(J.y,f.x,f.y);L=vec4(F(o,6.0),F(o,7.0));U=vec4(F(o,8.0),F(o,9.0));}float bj(vec2 G){vec2 aF=floor(clamp(G,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return aF.y*STROKES_ATLAS_COLS+aF.x;}vec2 aV(vec3 N,vec3 O,vec3 Q,vec3 t,vec4 L,vec3 w){vec3 c=vec3(dot(N,w),dot(O,w),dot(Q,w))+t;return L.xy*c.xy/c.z+L.zw;}vec2 bk(vec2 bm,vec3 X,vec3 Z){vec3 N,O,Q,t;vec4 L,U;aU(bj(bm),N,O,Q,t,L,U);vec2 d=(aV(N,O,Q,t,L,Z)-aV(N,O,Q,t,L,X))*U.zw;return vec2(-d.x,d.y);}vec3 bi(float o){vec2 a=F(o,0.0);vec2 b=F(o,1.0);vec2 c=F(o,2.0);vec2 d=F(o,3.0);vec2 J=F(o,4.0);vec2 f=F(o,5.0);vec3 t=vec3(J.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*t.x+vec3(b.y,c.x,c.y)*t.y+vec3(d.x,d.y,J.x)*t.z);}float bs(vec3 a5,out float an){float aE=0.0;an=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(bi(float(i))-a5);if(d<an){an=d;aE=float(i);}}return aE;}vec2 bt(float o,vec2 st){vec3 N,O,Q,t;vec4 L,U;aU(o,N,O,Q,t,L,U);return U.xy+vec2(st.x,1.0-st.y)*U.zw;}
#endif
#endif
void main(){float t=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float al=u_gsplatTexResolution.x;float a7=u_gsplatTexResolution.y;float aL=a_index;float bd=floor(aL/1024.0);float ai=mod(aL,1024.0)*4.0;float v=(bd+0.5)/a7;vec4 p1=texture2D(u_gsplatTex,vec2((ai+0.5)/al,v));v_position=vec4(p1.xyz,1.0);vec4 ah=u_viewMatrix*u_modelMatrix*v_position;vec4 ac=u_projectionMatrix*ah;vec4 p2=texture2D(u_gsplatTex,vec2((ai+1.5)/al,v));vec4 p3=texture2D(u_gsplatTex,vec2((ai+2.5)/al,v));vec4 p4=texture2D(u_gsplatTex,vec2((ai+3.5)/al,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 ay=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 M=a_(p3.zw);vec3 t1=normalize(cross((abs(M.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),M));vec3 t2=cross(M,t1);vec3 aY=ay*t1;vec3 az=ay*t2;float ag=dot(t1,aY),cb=dot(t1,az),cd=dot(t2,az);float aK=ag-cd;float ak=(abs(cb)<1e-9&&abs(aK)<1e-9)?0.0:0.5*atan(2.0*cb,aK);float aG=0.5*(ag+cd);float aJ=sqrt(max(0.25*(ag-cd)*(ag-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(aG+aJ,0.0));float s2=UV_FILL*sqrt(max(aG-aJ,0.0));vec3 aB=s1*(cos(ak)*t1+sin(ak)*t2);vec3 aC=s2*(-sin(ak)*t1+cos(ak)*t2);vec2 aM=u_focal/u_resolution;vec3 X=p1.xyz;vec3 Z=X+a_position.x*aB+a_position.y*aC;vec2 bn=aM*vec2(X.x,-X.y)/(-X.z)+0.5;vec2 bo=aM*vec2(Z.x,-Z.y)/(-Z.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=bk(v_uv,X,Z);
#else
v_uvStep=bo-bn;
#endif
v_texcoord=a_position;vec2 aw=ac.xy/ac.w;vec4 aH=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aB,1.0);vec4 aI=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aC,1.0);vec2 aq=aH.xy/aH.w-aw;vec2 ar=aI.xy/aI.w-aw;float aP=2.0/max(u_resolution.x,u_resolution.y);float ap=length(aq),l2n=length(ar);if(ap>1e-8)aq*=max(ap,aP)/ap;if(l2n>1e-8)ar*=max(l2n,aP)/l2n;v_position=vec4((a_position.x*aq+a_position.y*ar),ac.z/ac.w,1.0);float ae=SPLAT_SCALE;v_position.xy=aw+ae*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 ah=u_viewMatrix*u_modelMatrix*a_position;vec4 ac=u_projectionMatrix*ah;;float ae=6.0;ae*=smoothstep(0.45,0.5,1.0-fract(length(ah.z)-t));
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);
#if !defined(MODEL_PRIMITIVE_POINTS)
float a2=luma(texture2D(u_alignedTex,v_texcoord).rgb);float bq=a2;v_position.xyz+=v_normal*(0.0025*bq);
#endif
#endif
v_color=vec4(vec3(0.15,0.1,0.2),1.0);
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=ae;if(ae>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
