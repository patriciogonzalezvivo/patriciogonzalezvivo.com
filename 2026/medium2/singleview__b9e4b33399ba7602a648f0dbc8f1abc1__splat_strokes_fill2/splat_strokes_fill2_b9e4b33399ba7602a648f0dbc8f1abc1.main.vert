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
vec3 aK(vec2 f){vec3 H=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float o=max(-H.z,0.0);H.x+=H.x>=0.0?-o:o;H.y+=H.y>=0.0?-o:o;return normalize(H);}
#include "lygia/color/luma.glsl"
#include "lygia/generative/snoise.glsl"
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 B(float A,float aS){vec2 st=vec2((aS+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(A+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 N=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(N*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aB(float A,out vec3 I,out vec3 J,out vec3 L,out vec3 o,out vec4 G,out vec4 M){vec2 a=B(A,0.0);vec2 b=B(A,1.0);vec2 c=B(A,2.0);vec2 d=B(A,3.0);vec2 X=B(A,4.0);vec2 f=B(A,5.0);I=vec3(a.x,a.y,b.x);J=vec3(b.y,c.x,c.y);L=vec3(d.x,d.y,X.x);o=vec3(X.y,f.x,f.y);G=vec4(B(A,6.0),B(A,7.0));M=vec4(B(A,8.0),B(A,9.0));}float aQ(vec2 F){vec2 aq=floor(clamp(F,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return aq.y*STROKES_ATLAS_COLS+aq.x;}vec2 aC(vec3 I,vec3 J,vec3 L,vec3 o,vec4 G,vec3 w){vec3 c=vec3(dot(I,w),dot(J,w),dot(L,w))+o;return G.xy*c.xy/c.z+G.zw;}vec2 aR(vec2 aT,vec3 O,vec3 W){vec3 I,J,L,o;vec4 G,M;aB(aQ(aT),I,J,L,o,G,M);vec2 d=(aC(I,J,L,o,G,W)-aC(I,J,L,o,G,O))*M.zw;return vec2(-d.x,d.y);}vec3 aP(float A){vec2 a=B(A,0.0);vec2 b=B(A,1.0);vec2 c=B(A,2.0);vec2 d=B(A,3.0);vec2 X=B(A,4.0);vec2 f=B(A,5.0);vec3 o=vec3(X.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*o.x+vec3(b.y,c.x,c.y)*o.y+vec3(d.x,d.y,X.x)*o.z);}float aY(vec3 aH,out float af){float ap=0.0;af=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aP(float(i))-aH);if(d<af){af=d;ap=float(i);}}return ap;}vec2 aZ(float A,vec2 st){vec3 I,J,L,o;vec4 G,M;aB(A,I,J,L,o,G,M);return M.xy+vec2(st.x,1.0-st.y)*M.zw;}
#endif
#endif
void main(){float o=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float ae=u_gsplatTexResolution.x;float aI=u_gsplatTexResolution.y;float aw=a_index;float aM=floor(aw/1024.0);float ab=mod(aw,1024.0)*4.0;float v=(aM+0.5)/aI;vec4 p1=texture2D(u_gsplatTex,vec2((ab+0.5)/ae,v));v_position=vec4(p1.xyz,1.0);vec4 Q=u_viewMatrix*u_modelMatrix*v_position;vec4 Z=u_projectionMatrix*Q;vec4 p2=texture2D(u_gsplatTex,vec2((ab+1.5)/ae,v));vec4 p3=texture2D(u_gsplatTex,vec2((ab+2.5)/ae,v));vec4 p4=texture2D(u_gsplatTex,vec2((ab+3.5)/ae,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 al=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 H=aK(p3.zw);vec3 U=normalize(cross((abs(H.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),H));vec3 ad=cross(H,U);vec3 aF=al*U;vec3 am=al*ad;float aa=dot(U,aF),cb=dot(U,am),cd=dot(ad,am);float av=aa-cd;float ac=(abs(cb)<1e-9&&abs(av)<1e-9)?0.0:0.5*atan(2.0*cb,av);float ar=0.5*(aa+cd);float au=sqrt(max(0.25*(aa-cd)*(aa-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(ar+au,0.0));float s2=UV_FILL*sqrt(max(ar-au,0.0));vec3 an=s1*(cos(ac)*U+sin(ac)*ad);vec3 ao=s2*(-sin(ac)*U+cos(ac)*ad);vec2 ax=u_focal/u_resolution;vec3 O=p1.xyz;vec3 W=O+a_position.x*an+a_position.y*ao;vec2 aU=ax*vec2(O.x,-O.y)/(-O.z)+0.5;vec2 aV=ax*vec2(W.x,-W.y)/(-W.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aR(v_uv,O,W);
#else
v_uvStep=aV-aU;
#endif
v_texcoord=a_position;vec2 ak=Z.xy/Z.w;vec4 as=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+an,1.0);vec4 at=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ao,1.0);vec2 ah=as.xy/as.w-ak;vec2 ai=at.xy/at.w-ak;float ay=2.0/max(u_resolution.x,u_resolution.y);float ag=length(ah),l2n=length(ai);if(ag>1e-8)ah*=max(ag,ay)/ag;if(l2n>1e-8)ai*=max(l2n,ay)/l2n;v_position=vec4((a_position.x*ah+a_position.y*ai),Z.z/Z.w,1.0);float R=SPLAT_SCALE;R*=smoothstep(0.5,0.6,0.5+snoise(vec3(Q.x*1.5,Q.y*2.0,u_time*0.125))*0.5);v_position.xy=ak+R*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 Q=u_viewMatrix*u_modelMatrix*a_position;vec4 Z=u_projectionMatrix*Q;;float R=6.0;R*=smoothstep(0.45,0.5,1.0-fract(length(Q.z)-o));
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);
#if !defined(MODEL_PRIMITIVE_POINTS)
float aG=luma(texture2D(u_alignedTex,v_texcoord).rgb);float aW=aG;v_position.xyz+=v_normal*(0.001*aW);
#endif
#endif
v_color=u_color;
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=R;if(R>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
