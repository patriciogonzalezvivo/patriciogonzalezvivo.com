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
#ifdef MODEL_VERTEX_NORMAL
attribute vec3 a_normal;
#endif
#ifdef MODEL_VERTEX_TEXCOORD
attribute vec2 a_texcoord;
#endif
#endif
varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;
#define SPLAT_SCALE 1.
#define UV_FILL 0.55
vec3 aG(vec2 f){vec3 I=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float t=max(-I.z,0.0);I.x+=I.x>=0.0?-t:t;I.y+=I.y>=0.0?-t:t;return normalize(I);}
#include "lygia/generative/random.glsl"
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 F(float o,float aP){vec2 st=vec2((aP+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(o+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 W=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(W*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void ax(float o,out vec3 J,out vec3 L,out vec3 M,out vec3 t,out vec4 H,out vec4 N){vec2 a=F(o,0.0);vec2 b=F(o,1.0);vec2 c=F(o,2.0);vec2 d=F(o,3.0);vec2 e=F(o,4.0);vec2 f=F(o,5.0);J=vec3(a.x,a.y,b.x);L=vec3(b.y,c.x,c.y);M=vec3(d.x,d.y,e.x);t=vec3(e.y,f.x,f.y);H=vec4(F(o,6.0),F(o,7.0));N=vec4(F(o,8.0),F(o,9.0));}float aN(vec2 G){vec2 am=floor(clamp(G,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return am.y*STROKES_ATLAS_COLS+am.x;}vec2 ay(vec3 J,vec3 L,vec3 M,vec3 t,vec4 H,vec3 w){vec3 c=vec3(dot(J,w),dot(L,w),dot(M,w))+t;return H.xy*c.xy/c.z+H.zw;}vec2 aO(vec2 aQ,vec3 O,vec3 Q){vec3 J,L,M,t;vec4 H,N;ax(aN(aQ),J,L,M,t,H,N);vec2 d=(ay(J,L,M,t,H,Q)-ay(J,L,M,t,H,O))*N.zw;return vec2(-d.x,d.y);}vec3 aM(float o){vec2 a=F(o,0.0);vec2 b=F(o,1.0);vec2 c=F(o,2.0);vec2 d=F(o,3.0);vec2 e=F(o,4.0);vec2 f=F(o,5.0);vec3 t=vec3(e.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*t.x+vec3(b.y,c.x,c.y)*t.y+vec3(d.x,d.y,e.x)*t.z);}float aU(vec3 aC,out float ab){float al=0.0;ab=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aM(float(i))-aC);if(d<ab){ab=d;al=float(i);}}return al;}vec2 aV(float o,vec2 st){vec3 J,L,M,t;vec4 H,N;ax(o,J,L,M,t,H,N);return N.xy+vec2(st.x,1.0-st.y)*N.zw;}
#endif
#endif
void main(){
#ifdef MODEL_PRIMITIVE_GSPLATS
float aa=u_gsplatTexResolution.x;float aD=u_gsplatTexResolution.y;float as=a_index;float aI=floor(as/1024.0);float Y=mod(as,1024.0)*4.0;float v=(aI+0.5)/aD;vec4 p1=texture2D(u_gsplatTex,vec2((Y+0.5)/aa,v));v_position=vec4(p1.xyz,1.0);vec4 aB=u_viewMatrix*u_modelMatrix*v_position;vec4 Z=u_projectionMatrix*aB;vec4 p2=texture2D(u_gsplatTex,vec2((Y+1.5)/aa,v));vec4 p3=texture2D(u_gsplatTex,vec2((Y+2.5)/aa,v));vec4 p4=texture2D(u_gsplatTex,vec2((Y+3.5)/aa,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 ah=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 I=aG(p3.zw);vec3 t1=normalize(cross((abs(I.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),I));vec3 t2=cross(I,t1);vec3 aA=ah*t1;vec3 ai=ah*t2;float X=dot(t1,aA),cb=dot(t1,ai),cd=dot(t2,ai);float ar=X-cd;float phi=(abs(cb)<1e-9&&abs(ar)<1e-9)?0.0:0.5*atan(2.0*cb,ar);float an=0.5*(X+cd);float aq=sqrt(max(0.25*(X-cd)*(X-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(an+aq,0.0));float s2=UV_FILL*sqrt(max(an-aq,0.0));vec3 aj=s1*(cos(phi)*t1+sin(phi)*t2);vec3 ak=s2*(-sin(phi)*t1+cos(phi)*t2);vec2 at=u_focal/u_resolution;vec3 O=p1.xyz;vec3 Q=O+a_position.x*aj+a_position.y*ak;vec2 aR=at*vec2(O.x,-O.y)/(-O.z)+0.5;vec2 aS=at*vec2(Q.x,-Q.y)/(-Q.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aO(v_uv,O,Q);
#else
v_uvStep=aS-aR;
#endif
v_texcoord=a_position;vec2 ag=Z.xy/Z.w;vec4 ao=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aj,1.0);vec4 ap=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ak,1.0);vec2 ad=ao.xy/ao.w-ag;vec2 ae=ap.xy/ap.w-ag;float au=2.0/max(u_resolution.x,u_resolution.y);float ac=length(ad),l2n=length(ae);if(ac>1e-8)ad*=max(ac,au)/ac;if(l2n>1e-8)ae*=max(l2n,au)/l2n;v_position=vec4((a_position.x*ad+a_position.y*ae),Z.z/Z.w,1.0);float scale=SPLAT_SCALE;float t=u_time*0.125;v_position.xy=ag+scale*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=vec4(u_modelMatrix*vec4(a_normal,0.0)).xyz;
#endif
v_color=vec4(0.8,0.8,0.8,1.0);v_uv=v_texcoord;v_uvStep=vec2(0.0);gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
}
