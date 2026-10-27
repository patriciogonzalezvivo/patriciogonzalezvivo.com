// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_gsplatTex;uniform vec2 u_gsplatTexResolution;uniform mat4 u_projectionMatrix;uniform mat4 u_viewMatrix;uniform mat4 u_modelMatrix;uniform mat3 u_normalMatrix;uniform vec2 u_resolution;uniform vec2 u_focal;uniform float u_time;
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
#define UV_FILL 0.5
#include "lygia/generative/random.glsl"
#include "lygia/color/luma.glsl"
vec3 aO(vec2 f){vec3 J=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float o=max(-J.z,0.0);J.x+=J.x>=0.0?-o:o;J.y+=J.y>=0.0?-o:o;return normalize(J);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 F(float A,float aX){vec2 st=vec2((aX+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(A+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 U=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(U*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aF(float A,out vec3 M,out vec3 N,out vec3 O,out vec3 o,out vec4 I,out vec4 Q){vec2 a=F(A,0.0);vec2 b=F(A,1.0);vec2 c=F(A,2.0);vec2 d=F(A,3.0);vec2 Z=F(A,4.0);vec2 f=F(A,5.0);M=vec3(a.x,a.y,b.x);N=vec3(b.y,c.x,c.y);O=vec3(d.x,d.y,Z.x);o=vec3(Z.y,f.x,f.y);I=vec4(F(A,6.0),F(A,7.0));Q=vec4(F(A,8.0),F(A,9.0));}float aV(vec2 G){vec2 av=floor(clamp(G,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return av.y*STROKES_ATLAS_COLS+av.x;}vec2 aG(vec3 M,vec3 N,vec3 O,vec3 o,vec4 I,vec3 w){vec3 c=vec3(dot(M,w),dot(N,w),dot(O,w))+o;return I.xy*c.xy/c.z+I.zw;}vec2 aW(vec2 aY,vec3 W,vec3 Y){vec3 M,N,O,o;vec4 I,Q;aF(aV(aY),M,N,O,o,I,Q);vec2 d=(aG(M,N,O,o,I,Y)-aG(M,N,O,o,I,W))*Q.zw;return vec2(-d.x,d.y);}vec3 aU(float A){vec2 a=F(A,0.0);vec2 b=F(A,1.0);vec2 c=F(A,2.0);vec2 d=F(A,3.0);vec2 Z=F(A,4.0);vec2 f=F(A,5.0);vec3 o=vec3(Z.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*o.x+vec3(b.y,c.x,c.y)*o.y+vec3(d.x,d.y,Z.x)*o.z);}float a5(vec3 aL,out float ak){float at=0.0;ak=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aU(float(i))-aL);if(d<ak){ak=d;at=float(i);}}return at;}vec2 a6(float A,vec2 st){vec3 M,N,O,o;vec4 I,Q;aF(A,M,N,O,o,I,Q);return Q.xy+vec2(st.x,1.0-st.y)*Q.zw;}
#endif
#endif
void main(){float o=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float aj=u_gsplatTexResolution.x;float aM=u_gsplatTexResolution.y;float ag=a_index;float aR=floor(ag/1024.0);float af=mod(ag,1024.0)*4.0;float v=(aR+0.5)/aM;vec4 p1=texture2D(u_gsplatTex,vec2((af+0.5)/aj,v));v_position=vec4(p1.xyz,1.0);vec4 ad=u_viewMatrix*u_modelMatrix*v_position;vec4 H=u_projectionMatrix*ad;float ae=1.5*H.w;if(H.z<-H.w||H.z>H.w||H.x<-ae||H.x>ae||H.y<-ae||H.y>ae){gl_Position=vec4(0.0,0.0,2.0,1.0);return;}vec4 p2=texture2D(u_gsplatTex,vec2((af+1.5)/aj,v));vec4 p3=texture2D(u_gsplatTex,vec2((af+2.5)/aj,v));vec4 p4=texture2D(u_gsplatTex,vec2((af+3.5)/aj,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 ap=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 J=aO(p3.zw);vec3 X=normalize(cross((abs(J.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),J));vec3 ai=cross(J,X);vec3 aJ=ap*X;vec3 aq=ap*ai;float ac=dot(X,aJ),cb=dot(X,aq),cd=dot(ai,aq);float aA=ac-cd;float ah=(abs(cb)<1e-9&&abs(aA)<1e-9)?0.0:0.5*atan(2.0*cb,aA);float aw=0.5*(ac+cd);float az=sqrt(max(0.25*(ac-cd)*(ac-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(aw+az,0.0));float s2=UV_FILL*sqrt(max(aw-az,0.0));vec3 ar=s1*(cos(ah)*X+sin(ah)*ai);vec3 as=s2*(-sin(ah)*X+cos(ah)*ai);vec2 aB=u_focal/u_resolution;vec3 W=p1.xyz;vec3 Y=W+a_position.x*ar+a_position.y*as;vec2 aZ=aB*vec2(W.x,-W.y)/(-W.z)+0.5;vec2 a2=aB*vec2(Y.x,-Y.y)/(-Y.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aW(v_uv,W,Y);
#else
v_uvStep=a2-aZ;
#endif
v_texcoord=a_position;vec2 ao=H.xy/H.w;vec4 ax=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ar,1.0);vec4 ay=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+as,1.0);vec2 am=ax.xy/ax.w-ao;vec2 an=ay.xy/ay.w-ao;float aC=2.0/max(u_resolution.x,u_resolution.y);float al=length(am),l2n=length(an);if(al>1e-8)am*=max(al,aC)/al;if(l2n>1e-8)an*=max(l2n,aC)/l2n;v_position=vec4((a_position.x*am+a_position.y*an),H.z/H.w,1.0);v_position.y+=fract(u_time*0.05+fract(ag*0.1)*3.1415)*step(0.9,sin(u_time*0.1+ag*0.1));float ab=SPLAT_SCALE;v_position.xy=ao+ab*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 ad=u_viewMatrix*u_modelMatrix*a_position;vec4 H=u_projectionMatrix*ad;;float ab=6.0;ab*=smoothstep(0.45,0.5,1.0-fract(length(ad.z)-o));
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);vec3 aK=texture2D(u_alignedTex,v_texcoord).rgb;float au=luma(aK);
#if !defined(MODEL_PRIMITIVE_POINTS)
float a3=0.002+au;v_position.xyz+=v_normal*(0.003*a3);
#endif
#endif
v_color=vec4(mix(vec3(0.0),vec3(0.0,0.7,0.9),au),1.0);
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=ab;if(ab>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
