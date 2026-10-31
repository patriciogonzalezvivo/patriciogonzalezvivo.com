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
#define SPLAT_SCALE 1.25
#define UV_FILL 0.55
vec3 aR(vec2 f){vec3 I=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float E=max(-I.z,0.0);I.x+=I.x>=0.0?-E:E;I.y+=I.y>=0.0?-E:E;return normalize(I);}
#include "lygia/color/luma.glsl"
#include "lygia/generative/snoise.glsl"
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 G(float F,float aY){vec2 st=vec2((aY+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(F+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 Q=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(Q*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aH(float F,out vec3 J,out vec3 M,out vec3 N,out vec3 E,out vec4 H,out vec4 O){vec2 a=G(F,0.0);vec2 b=G(F,1.0);vec2 c=G(F,2.0);vec2 d=G(F,3.0);vec2 aa=G(F,4.0);vec2 f=G(F,5.0);J=vec3(a.x,a.y,b.x);M=vec3(b.y,c.x,c.y);N=vec3(d.x,d.y,aa.x);E=vec3(aa.y,f.x,f.y);H=vec4(G(F,6.0),G(F,7.0));O=vec4(G(F,8.0),G(F,9.0));}float aW(vec2 uv){vec2 at=floor(clamp(uv,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return at.y*STROKES_ATLAS_COLS+at.x;}vec2 aI(vec3 J,vec3 M,vec3 N,vec3 E,vec4 H,vec3 w){vec3 c=vec3(dot(J,w),dot(M,w),dot(N,w))+E;return H.xy*c.xy/c.z+H.zw;}vec2 aX(vec2 aZ,vec3 U,vec3 Z){vec3 J,M,N,E;vec4 H,O;aH(aW(aZ),J,M,N,E,H,O);vec2 d=(aI(J,M,N,E,H,Z)-aI(J,M,N,E,H,U))*O.zw;return vec2(-d.x,d.y);}vec3 aV(float F){vec2 a=G(F,0.0);vec2 b=G(F,1.0);vec2 c=G(F,2.0);vec2 d=G(F,3.0);vec2 aa=G(F,4.0);vec2 f=G(F,5.0);vec3 E=vec3(aa.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*E.x+vec3(b.y,c.x,c.y)*E.y+vec3(d.x,d.y,aa.x)*E.z);}float a6(vec3 aO,out float aj){float as=0.0;aj=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aV(float(i))-aO);if(d<aj){aj=d;as=float(i);}}return as;}vec2 a7(float F,vec2 st){vec3 J,M,N,E;vec4 H,O;aH(F,J,M,N,E,H,O);return O.xy+vec2(st.x,1.0-st.y)*O.zw;}
#endif
#endif
void main(){float E=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float ai=u_gsplatTexResolution.x;float aP=u_gsplatTexResolution.y;float az=a_index;float aS=floor(az/1024.0);float af=mod(az,1024.0)*4.0;float v=(aS+0.5)/aP;vec4 p1=texture2D(u_gsplatTex,vec2((af+0.5)/ai,v));v_position=vec4(p1.xyz,1.0);vec4 W=u_viewMatrix*u_modelMatrix*v_position;vec4 ad=u_projectionMatrix*W;vec4 p2=texture2D(u_gsplatTex,vec2((af+1.5)/ai,v));vec4 p3=texture2D(u_gsplatTex,vec2((af+2.5)/ai,v));vec4 p4=texture2D(u_gsplatTex,vec2((af+3.5)/ai,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 ao=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 I=aR(p3.zw);vec3 Y=normalize(cross((abs(I.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),I));vec3 ah=cross(I,Y);vec3 aL=ao*Y;vec3 ap=ao*ah;float ae=dot(Y,aL),cb=dot(Y,ap),cd=dot(ah,ap);float ay=ae-cd;float ag=(abs(cb)<1e-9&&abs(ay)<1e-9)?0.0:0.5*atan(2.0*cb,ay);float au=0.5*(ae+cd);float ax=sqrt(max(0.25*(ae-cd)*(ae-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(au+ax,0.0));float s2=UV_FILL*sqrt(max(au-ax,0.0));vec3 aq=s1*(cos(ag)*Y+sin(ag)*ah);vec3 ar=s2*(-sin(ag)*Y+cos(ag)*ah);vec2 aB=u_focal/u_resolution;vec3 U=p1.xyz;vec3 Z=U+a_position.x*aq+a_position.y*ar;vec2 a2=aB*vec2(U.x,-U.y)/(-U.z)+0.5;vec2 a3=aB*vec2(Z.x,-Z.y)/(-Z.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aX(v_uv,U,Z);
#else
v_uvStep=a3-a2;
#endif
v_texcoord=a_position;vec2 an=ad.xy/ad.w;vec4 av=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aq,1.0);vec4 aw=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ar,1.0);vec2 al=av.xy/av.w-an;vec2 am=aw.xy/aw.w-an;float aE=2.0/max(u_resolution.x,u_resolution.y);float ak=length(al),l2n=length(am);if(ak>1e-8)al*=max(ak,aE)/ak;if(l2n>1e-8)am*=max(l2n,aE)/l2n;v_position=vec4((a_position.x*al+a_position.y*am),ad.z/ad.w,1.0);float X=SPLAT_SCALE;X*=smoothstep(0.5,0.6,0.5+snoise(vec3(W.x*1.5,W.y*2.0,u_time*0.125))*0.5);v_position.xy=an+X*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 W=u_viewMatrix*u_modelMatrix*a_position;vec4 ad=u_projectionMatrix*W;;float X=6.0;X*=smoothstep(0.45,0.5,1.0-fract(length(W.z)-E));
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);
#if !defined(MODEL_PRIMITIVE_POINTS)
float aM=luma(texture2D(u_alignedTex,v_texcoord).rgb);float a4=aM;v_position.xyz+=v_normal*(0.001+0.001*a4);
#endif
#endif
v_color=u_color;
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=X;if(X>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
