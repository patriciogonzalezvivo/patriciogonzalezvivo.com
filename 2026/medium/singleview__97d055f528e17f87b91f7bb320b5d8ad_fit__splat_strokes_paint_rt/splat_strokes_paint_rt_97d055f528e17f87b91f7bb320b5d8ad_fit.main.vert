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
vec3 aH(vec2 f){vec3 I=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float t=max(-I.z,0.0);I.x+=I.x>=0.0?-t:t;I.y+=I.y>=0.0?-t:t;return normalize(I);}
#include "lygia/generative/random.glsl"
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 F(float E,float aQ){vec2 st=vec2((aQ+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(E+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 X=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(X*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void ay(float E,out vec3 J,out vec3 M,out vec3 N,out vec3 t,out vec4 H,out vec4 O){vec2 a=F(E,0.0);vec2 b=F(E,1.0);vec2 c=F(E,2.0);vec2 d=F(E,3.0);vec2 e=F(E,4.0);vec2 f=F(E,5.0);J=vec3(a.x,a.y,b.x);M=vec3(b.y,c.x,c.y);N=vec3(d.x,d.y,e.x);t=vec3(e.y,f.x,f.y);H=vec4(F(E,6.0),F(E,7.0));O=vec4(F(E,8.0),F(E,9.0));}float aO(vec2 G){vec2 an=floor(clamp(G,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return an.y*STROKES_ATLAS_COLS+an.x;}vec2 az(vec3 J,vec3 M,vec3 N,vec3 t,vec4 H,vec3 w){vec3 c=vec3(dot(J,w),dot(M,w),dot(N,w))+t;return H.xy*c.xy/c.z+H.zw;}vec2 aP(vec2 aR,vec3 Q,vec3 U){vec3 J,M,N,t;vec4 H,O;ay(aO(aR),J,M,N,t,H,O);vec2 d=(az(J,M,N,t,H,U)-az(J,M,N,t,H,Q))*O.zw;return vec2(-d.x,d.y);}vec3 aN(float E){vec2 a=F(E,0.0);vec2 b=F(E,1.0);vec2 c=F(E,2.0);vec2 d=F(E,3.0);vec2 e=F(E,4.0);vec2 f=F(E,5.0);vec3 t=vec3(e.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*t.x+vec3(b.y,c.x,c.y)*t.y+vec3(d.x,d.y,e.x)*t.z);}float aV(vec3 aD,out float ac){float am=0.0;ac=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aN(float(i))-aD);if(d<ac){ac=d;am=float(i);}}return am;}vec2 aW(float E,vec2 st){vec3 J,M,N,t;vec4 H,O;ay(E,J,M,N,t,H,O);return O.xy+vec2(st.x,1.0-st.y)*O.zw;}
#endif
#endif
void main(){
#ifdef MODEL_PRIMITIVE_GSPLATS
float ab=u_gsplatTexResolution.x;float aE=u_gsplatTexResolution.y;float at=a_index;float aK=floor(at/1024.0);float Z=mod(at,1024.0)*4.0;float v=(aK+0.5)/aE;vec4 p1=texture2D(u_gsplatTex,vec2((Z+0.5)/ab,v));v_position=vec4(p1.xyz,1.0);vec4 aC=u_viewMatrix*u_modelMatrix*v_position;vec4 aa=u_projectionMatrix*aC;vec4 p2=texture2D(u_gsplatTex,vec2((Z+1.5)/ab,v));vec4 p3=texture2D(u_gsplatTex,vec2((Z+2.5)/ab,v));vec4 p4=texture2D(u_gsplatTex,vec2((Z+3.5)/ab,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 ai=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 I=aH(p3.zw);vec3 t1=normalize(cross((abs(I.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),I));vec3 t2=cross(I,t1);vec3 aB=ai*t1;vec3 aj=ai*t2;float Y=dot(t1,aB),cb=dot(t1,aj),cd=dot(t2,aj);float as=Y-cd;float phi=(abs(cb)<1e-9&&abs(as)<1e-9)?0.0:0.5*atan(2.0*cb,as);float ao=0.5*(Y+cd);float ar=sqrt(max(0.25*(Y-cd)*(Y-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(ao+ar,0.0));float s2=UV_FILL*sqrt(max(ao-ar,0.0));vec3 ak=s1*(cos(phi)*t1+sin(phi)*t2);vec3 al=s2*(-sin(phi)*t1+cos(phi)*t2);vec2 au=u_focal/u_resolution;vec3 Q=p1.xyz;vec3 U=Q+a_position.x*ak+a_position.y*al;vec2 aS=au*vec2(Q.x,-Q.y)/(-Q.z)+0.5;vec2 aT=au*vec2(U.x,-U.y)/(-U.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aP(v_uv,Q,U);
#else
v_uvStep=aT-aS;
#endif
v_texcoord=a_position;vec2 ah=aa.xy/aa.w;vec4 ap=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ak,1.0);vec4 aq=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+al,1.0);vec2 ae=ap.xy/ap.w-ah;vec2 af=aq.xy/aq.w-ah;float av=2.0/max(u_resolution.x,u_resolution.y);float ad=length(ae),l2n=length(af);if(ad>1e-8)ae*=max(ad,av)/ad;if(l2n>1e-8)af*=max(l2n,av)/l2n;v_position=vec4((a_position.x*ae+a_position.y*af),aa.z/aa.w,1.0);float scale=SPLAT_SCALE;float t=u_time*0.125;v_position.xy=ah+scale*v_position.xy;gl_Position=v_position;
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
