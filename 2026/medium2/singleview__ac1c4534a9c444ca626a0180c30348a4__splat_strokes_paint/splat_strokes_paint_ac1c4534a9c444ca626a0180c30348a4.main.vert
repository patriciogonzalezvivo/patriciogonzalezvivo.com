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
vec3 aF(vec2 f){vec3 n=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float t=max(-n.z,0.0);n.x+=n.x>=0.0?-t:t;n.y+=n.y>=0.0?-t:t;return normalize(n);}
#include "lygia/generative/random.glsl"
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 o(float view,float aO){vec2 st=vec2((aO+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(view+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 X=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(X*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void ax(float view,out vec3 G,out vec3 I,out vec3 J,out vec3 t,out vec4 K,out vec4 M){vec2 a=o(view,0.0);vec2 b=o(view,1.0);vec2 c=o(view,2.0);vec2 d=o(view,3.0);vec2 e=o(view,4.0);vec2 f=o(view,5.0);G=vec3(a.x,a.y,b.x);I=vec3(b.y,c.x,c.y);J=vec3(d.x,d.y,e.x);t=vec3(e.y,f.x,f.y);K=vec4(o(view,6.0),o(view,7.0));M=vec4(o(view,8.0),o(view,9.0));}float aM(vec2 uv){vec2 al=floor(clamp(uv,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return al.y*STROKES_ATLAS_COLS+al.x;}vec2 ay(vec3 G,vec3 I,vec3 J,vec3 t,vec4 K,vec3 w){vec3 c=vec3(dot(G,w),dot(I,w),dot(J,w))+t;return K.xy*c.xy/c.z+K.zw;}vec2 aN(vec2 aP,vec3 O,vec3 Q){vec3 G,I,J,t;vec4 K,M;ax(aM(aP),G,I,J,t,K,M);vec2 d=(ay(G,I,J,t,K,Q)-ay(G,I,J,t,K,O))*M.zw;return vec2(-d.x,d.y);}vec3 aL(float view){vec2 a=o(view,0.0);vec2 b=o(view,1.0);vec2 c=o(view,2.0);vec2 d=o(view,3.0);vec2 e=o(view,4.0);vec2 f=o(view,5.0);vec3 t=vec3(e.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*t.x+vec3(b.y,c.x,c.y)*t.y+vec3(d.x,d.y,e.x)*t.z);}float aT(vec3 aC,out float dist){float ak=0.0;dist=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aL(float(i))-aC);if(d<dist){dist=d;ak=float(i);}}return ak;}vec2 aU(float view,vec2 st){vec3 G,I,J,t;vec4 K,M;ax(view,G,I,J,t,K,M);return M.xy+vec2(st.x,1.0-st.y)*M.zw;}
#endif
#endif
void main(){
#ifdef MODEL_PRIMITIVE_GSPLATS
float width=u_gsplatTexResolution.x;float aD=u_gsplatTexResolution.y;float as=a_index;float aI=floor(as/1024.0);float Z=mod(as,1024.0)*4.0;float v=(aI+0.5)/aD;vec4 p1=texture2D(u_gsplatTex,vec2((Z+0.5)/width,v));v_position=vec4(p1.xyz,1.0);vec4 aB=u_viewMatrix*u_modelMatrix*v_position;vec4 aa=u_projectionMatrix*aB;vec4 p2=texture2D(u_gsplatTex,vec2((Z+1.5)/width,v));vec4 p3=texture2D(u_gsplatTex,vec2((Z+2.5)/width,v));vec4 p4=texture2D(u_gsplatTex,vec2((Z+3.5)/width,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 ag=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 n=aF(p3.zw);vec3 t1=normalize(cross((abs(n.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),n));vec3 t2=cross(n,t1);vec3 aA=ag*t1;vec3 ah=ag*t2;float Y=dot(t1,aA),cb=dot(t1,ah),cd=dot(t2,ah);float ar=Y-cd;float phi=(abs(cb)<1e-9&&abs(ar)<1e-9)?0.0:0.5*atan(2.0*cb,ar);float am=0.5*(Y+cd);float aq=sqrt(max(0.25*(Y-cd)*(Y-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(am+aq,0.0));float s2=UV_FILL*sqrt(max(am-aq,0.0));vec3 ai=s1*(cos(phi)*t1+sin(phi)*t2);vec3 aj=s2*(-sin(phi)*t1+cos(phi)*t2);vec2 at=u_focal/u_resolution;vec3 O=p1.xyz;vec3 Q=O+a_position.x*ai+a_position.y*aj;vec2 aQ=at*vec2(O.x,-O.y)/(-O.z)+0.5;vec2 aR=at*vec2(Q.x,-Q.y)/(-Q.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aN(v_uv,O,Q);
#else
v_uvStep=aR-aQ;
#endif
v_texcoord=a_position;vec2 af=aa.xy/aa.w;vec4 an=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ai,1.0);vec4 ap=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aj,1.0);vec2 ac=an.xy/an.w-af;vec2 ad=ap.xy/ap.w-af;float au=2.0/max(u_resolution.x,u_resolution.y);float ab=length(ac),l2n=length(ad);if(ab>1e-8)ac*=max(ab,au)/ab;if(l2n>1e-8)ad*=max(l2n,au)/l2n;v_position=vec4((a_position.x*ac+a_position.y*ad),aa.z/aa.w,1.0);float scale=SPLAT_SCALE;float t=u_time*0.125;v_position.xy=af+scale*v_position.xy;gl_Position=v_position;
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
