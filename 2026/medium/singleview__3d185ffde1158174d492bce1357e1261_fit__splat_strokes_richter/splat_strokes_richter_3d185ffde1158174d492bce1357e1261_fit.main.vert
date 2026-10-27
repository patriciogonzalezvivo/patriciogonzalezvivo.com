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
vec3 bg(vec2 f){vec3 N=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float t=max(-N.z,0.0);N.x+=N.x>=0.0?-t:t;N.y+=N.y>=0.0?-t:t;return normalize(N);}
#include "lygia/color/luma.glsl"
#include "lygia/generative/snoise.glsl"
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 G(float E,float bt){vec2 st=vec2((bt+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(E+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 ai=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(ai*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void a6(float E,out vec3 Q,out vec3 U,out vec3 W,out vec3 t,out vec4 M,out vec4 X){vec2 a=G(E,0.0);vec2 b=G(E,1.0);vec2 c=G(E,2.0);vec2 d=G(E,3.0);vec2 J=G(E,4.0);vec2 f=G(E,5.0);Q=vec3(a.x,a.y,b.x);U=vec3(b.y,c.x,c.y);W=vec3(d.x,d.y,J.x);t=vec3(J.y,f.x,f.y);M=vec4(G(E,6.0),G(E,7.0));X=vec4(G(E,8.0),G(E,9.0));}float br(vec2 F){vec2 aL=floor(clamp(F,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return aL.y*STROKES_ATLAS_COLS+aL.x;}vec2 a7(vec3 Q,vec3 U,vec3 W,vec3 t,vec4 M,vec3 w){vec3 c=vec3(dot(Q,w),dot(U,w),dot(W,w))+t;return M.xy*c.xy/c.z+M.zw;}vec2 bs(vec2 bu,vec3 aa,vec3 ae){vec3 Q,U,W,t;vec4 M,X;a6(br(bu),Q,U,W,t,M,X);vec2 d=(a7(Q,U,W,t,M,ae)-a7(Q,U,W,t,M,aa))*X.zw;return vec2(-d.x,d.y);}vec3 bq(float E){vec2 a=G(E,0.0);vec2 b=G(E,1.0);vec2 c=G(E,2.0);vec2 d=G(E,3.0);vec2 J=G(E,4.0);vec2 f=G(E,5.0);vec3 t=vec3(J.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*t.x+vec3(b.y,c.x,c.y)*t.y+vec3(d.x,d.y,J.x)*t.z);}float bB(vec3 bc,out float at){float aK=0.0;at=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(bq(float(i))-bc);if(d<at){at=d;aK=float(i);}}return aK;}vec2 bC(float E,vec2 st){vec3 Q,U,W,t;vec4 M,X;a6(E,Q,U,W,t,M,X);return X.xy+vec2(st.x,1.0-st.y)*X.zw;}
#endif
#endif
void main(){float t=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float aq=u_gsplatTexResolution.x;float bd=u_gsplatTexResolution.y;float aR=a_index;float bl=floor(aR/1024.0);float an=mod(aR,1024.0)*4.0;float v=(bl+0.5)/bd;vec4 p1=texture2D(u_gsplatTex,vec2((an+0.5)/aq,v));v_position=vec4(p1.xyz,1.0);vec4 am=u_viewMatrix*u_modelMatrix*v_position;vec4 ah=u_projectionMatrix*am;vec4 p2=texture2D(u_gsplatTex,vec2((an+1.5)/aq,v));vec4 p3=texture2D(u_gsplatTex,vec2((an+2.5)/aq,v));vec4 p4=texture2D(u_gsplatTex,vec2((an+3.5)/aq,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 aE=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 N=bg(p3.zw);vec3 t1=normalize(cross((abs(N.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),N));vec3 t2=cross(N,t1);vec3 a_=aE*t1;vec3 aF=aE*t2;float al=dot(t1,a_),cb=dot(t1,aF),cd=dot(t2,aF);float aQ=al-cd;float ap=(abs(cb)<1e-9&&abs(aQ)<1e-9)?0.0:0.5*atan(2.0*cb,aQ);float aM=0.5*(al+cd);float aP=sqrt(max(0.25*(al-cd)*(al-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(aM+aP,0.0));float s2=UV_FILL*sqrt(max(aM-aP,0.0));vec3 aH=s1*(cos(ap)*t1+sin(ap)*t2);vec3 aI=s2*(-sin(ap)*t1+cos(ap)*t2);vec2 aS=u_focal/u_resolution;vec3 aa=p1.xyz;vec3 ae=aa+a_position.x*aH+a_position.y*aI;vec2 bv=aS*vec2(aa.x,-aa.y)/(-aa.z)+0.5;vec2 bw=aS*vec2(ae.x,-ae.y)/(-ae.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=bs(v_uv,aa,ae);
#else
v_uvStep=bw-bv;
#endif
v_texcoord=a_position;vec2 aC=ah.xy/ah.w;vec4 aN=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aH,1.0);vec4 aO=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aI,1.0);vec2 ax=aN.xy/aN.w-aC;vec2 ay=aO.xy/aO.w-aC;float aW=2.0/max(u_resolution.x,u_resolution.y);float av=length(ax),l2n=length(ay);if(av>1e-8)ax*=max(av,aW)/av;if(l2n>1e-8)ay*=max(l2n,aW)/l2n;v_position=vec4((a_position.x*ax+a_position.y*ay),ah.z/ah.w,1.0);float aj=SPLAT_SCALE;v_position.xy=aC+aj*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 am=u_viewMatrix*u_modelMatrix*a_position;vec4 ah=u_projectionMatrix*am;;float aj=6.0;aj*=smoothstep(0.45,0.5,1.0-fract(length(am.z)-t));
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);
#if !defined(MODEL_PRIMITIVE_POINTS)
float bb=luma(texture2D(u_alignedTex,v_texcoord).rgb);float by=bb;v_position.xyz+=v_normal*(0.0025*by);
#endif
#endif
v_color=vec4(vec3(0.15,0.1,0.2),1.0);
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=aj;if(aj>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
