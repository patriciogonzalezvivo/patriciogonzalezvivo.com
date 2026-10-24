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
vec3 aQ(vec2 f){vec3 H=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float o=max(-H.z,0.0);H.x+=H.x>=0.0?-o:o;H.y+=H.y>=0.0?-o:o;return normalize(H);}
#include "lygia/color/luma.glsl"
#include "lygia/generative/snoise.glsl"
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 F(float E,float aX){vec2 st=vec2((aX+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(E+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 O=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(O*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aG(float E,out vec3 I,out vec3 J,out vec3 M,out vec3 o,out vec4 G,out vec4 N){vec2 a=F(E,0.0);vec2 b=F(E,1.0);vec2 c=F(E,2.0);vec2 d=F(E,3.0);vec2 Z=F(E,4.0);vec2 f=F(E,5.0);I=vec3(a.x,a.y,b.x);J=vec3(b.y,c.x,c.y);M=vec3(d.x,d.y,Z.x);o=vec3(Z.y,f.x,f.y);G=vec4(F(E,6.0),F(E,7.0));N=vec4(F(E,8.0),F(E,9.0));}float aV(vec2 uv){vec2 ar=floor(clamp(uv,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return ar.y*STROKES_ATLAS_COLS+ar.x;}vec2 aH(vec3 I,vec3 J,vec3 M,vec3 o,vec4 G,vec3 w){vec3 c=vec3(dot(I,w),dot(J,w),dot(M,w))+o;return G.xy*c.xy/c.z+G.zw;}vec2 aW(vec2 aY,vec3 Q,vec3 Y){vec3 I,J,M,o;vec4 G,N;aG(aV(aY),I,J,M,o,G,N);vec2 d=(aH(I,J,M,o,G,Y)-aH(I,J,M,o,G,Q))*N.zw;return vec2(-d.x,d.y);}vec3 aU(float E){vec2 a=F(E,0.0);vec2 b=F(E,1.0);vec2 c=F(E,2.0);vec2 d=F(E,3.0);vec2 Z=F(E,4.0);vec2 f=F(E,5.0);vec3 o=vec3(Z.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*o.x+vec3(b.y,c.x,c.y)*o.y+vec3(d.x,d.y,Z.x)*o.z);}float a5(vec3 aN,out float ah){float aq=0.0;ah=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aU(float(i))-aN);if(d<ah){ah=d;aq=float(i);}}return aq;}vec2 a6(float E,vec2 st){vec3 I,J,M,o;vec4 G,N;aG(E,I,J,M,o,G,N);return N.xy+vec2(st.x,1.0-st.y)*N.zw;}
#endif
#endif
void main(){float o=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float ag=u_gsplatTexResolution.x;float aO=u_gsplatTexResolution.y;float ax=a_index;float aR=floor(ax/1024.0);float ad=mod(ax,1024.0)*4.0;float v=(aR+0.5)/aO;vec4 p1=texture2D(u_gsplatTex,vec2((ad+0.5)/ag,v));v_position=vec4(p1.xyz,1.0);vec4 U=u_viewMatrix*u_modelMatrix*v_position;vec4 ab=u_projectionMatrix*U;vec4 p2=texture2D(u_gsplatTex,vec2((ad+1.5)/ag,v));vec4 p3=texture2D(u_gsplatTex,vec2((ad+2.5)/ag,v));vec4 p4=texture2D(u_gsplatTex,vec2((ad+3.5)/ag,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 am=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 H=aQ(p3.zw);vec3 X=normalize(cross((abs(H.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),H));vec3 af=cross(H,X);vec3 aK=am*X;vec3 an=am*af;float ac=dot(X,aK),cb=dot(X,an),cd=dot(af,an);float aw=ac-cd;float ae=(abs(cb)<1e-9&&abs(aw)<1e-9)?0.0:0.5*atan(2.0*cb,aw);float as=0.5*(ac+cd);float av=sqrt(max(0.25*(ac-cd)*(ac-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(as+av,0.0));float s2=UV_FILL*sqrt(max(as-av,0.0));vec3 ao=s1*(cos(ae)*X+sin(ae)*af);vec3 ap=s2*(-sin(ae)*X+cos(ae)*af);vec2 az=u_focal/u_resolution;vec3 Q=p1.xyz;vec3 Y=Q+a_position.x*ao+a_position.y*ap;vec2 aZ=az*vec2(Q.x,-Q.y)/(-Q.z)+0.5;vec2 a2=az*vec2(Y.x,-Y.y)/(-Y.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aW(v_uv,Q,Y);
#else
v_uvStep=a2-aZ;
#endif
v_texcoord=a_position;vec2 al=ab.xy/ab.w;vec4 at=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ao,1.0);vec4 au=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ap,1.0);vec2 aj=at.xy/at.w-al;vec2 ak=au.xy/au.w-al;float aC=2.0/max(u_resolution.x,u_resolution.y);float ai=length(aj),l2n=length(ak);if(ai>1e-8)aj*=max(ai,aC)/ai;if(l2n>1e-8)ak*=max(l2n,aC)/l2n;v_position=vec4((a_position.x*aj+a_position.y*ak),ab.z/ab.w,1.0);float W=SPLAT_SCALE;W*=smoothstep(0.5,0.6,0.5+snoise(vec3(U.x*1.5,U.y*2.0,u_time*0.125))*0.5);v_position.xy=al+W*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 U=u_viewMatrix*u_modelMatrix*a_position;vec4 ab=u_projectionMatrix*U;;float W=6.0;W*=smoothstep(0.45,0.5,1.0-fract(length(U.z)-o));
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);
#if !defined(MODEL_PRIMITIVE_POINTS)
float aL=luma(texture2D(u_alignedTex,v_texcoord).rgb);float a3=aL;v_position.xyz+=v_normal*(0.001+0.001*a3);
#endif
#endif
v_color=u_color;
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=W;if(W>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
