// This shader includes code from LYGIA, Copyright (c) Patricio Gonzalez Vivo
// https://lygia.xyz -- dual-licensed under the Prosperity License 3.0.0
// (https://prosperitylicense.com/versions/3.0.0) and the Patron License
// (https://lygia.xyz/license). Source: https://github.com/patriciogonzalezvivo/lygia
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_alignedTex;uniform sampler2D u_gsplatTex;uniform vec2 u_gsplatTexResolution;uniform mat4 u_projectionMatrix;uniform mat4 u_viewMatrix;uniform mat4 u_modelMatrix;uniform mat3 u_normalMatrix;uniform vec2 u_resolution;uniform vec2 u_focal;uniform float u_time;uniform float u_delta;
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
varying vec4 v_position;varying vec4 v_color;varying vec3 v_normal;varying vec2 v_texcoord;varying vec2 v_uv;varying vec2 v_uvStep;varying vec2 v_vel;
#define SPLAT_SCALE 1.
#define UV_FILL 0.5
#define STROKE_TRAVEL 1.5
#define STROKE_SPEED 0.25
#include "lygia/math/const.glsl"
#include "lygia/generative/random.glsl"
#include "lygia/color/luma.glsl"
#ifndef MAP_FLIP_Y
#define MAP_FLIP_Y 1
#endif
#ifndef MAP_WRAP
#define MAP_WRAP 0
#endif
#ifndef MAP_SAMEMARK_EPSILON
#define MAP_SAMEMARK_EPSILON (0.5/255.0)
#endif
#ifndef FNC_MAP
#define FNC_MAP
#ifndef MAP_INDEX_TEX
#define MAP_INDEX_TEX u_strokeIndicesTex
#define MAP_INDEX_RESOLUTION u_strokeIndicesTexResolution
uniform sampler2D u_strokeIndicesTex;uniform vec2 u_strokeIndicesTexResolution;
#endif
vec2 ae(vec2 uv){
#if MAP_FLIP_Y
uv.y=1.0-uv.y;
#endif
#if MAP_WRAP
uv=fract(uv);
#endif
return uv;}vec4 aL(sampler2D tex,vec2 uv){return texture2D(tex,ae(uv));}vec4 ak(vec2 uv){vec2 g=ae(uv);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aK(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
vec2 aN(vec2 aS,float ai,float a6){return aS*STROKE_TRAVEL*sin(TAU*(a6*STROKE_SPEED+ai));}vec3 aX(vec2 f){vec3 I=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float A=max(-I.z,0.0);I.x+=I.x>=0.0?-A:A;I.y+=I.y>=0.0?-A:A;return normalize(I);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 F(float E,float a5){vec2 st=vec2((a5+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(E+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 Q=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(Q*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aO(float E,out vec3 J,out vec3 M,out vec3 N,out vec3 A,out vec4 H,out vec4 O){vec2 a=F(E,0.0);vec2 b=F(E,1.0);vec2 c=F(E,2.0);vec2 d=F(E,3.0);vec2 Z=F(E,4.0);vec2 f=F(E,5.0);J=vec3(a.x,a.y,b.x);M=vec3(b.y,c.x,c.y);N=vec3(d.x,d.y,Z.x);A=vec3(Z.y,f.x,f.y);H=vec4(F(E,6.0),F(E,7.0));O=vec4(F(E,8.0),F(E,9.0));}float a3(vec2 uv){vec2 az=floor(clamp(uv,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return az.y*STROKES_ATLAS_COLS+az.x;}vec2 aP(vec3 J,vec3 M,vec3 N,vec3 A,vec4 H,vec3 w){vec3 c=vec3(dot(J,w),dot(M,w),dot(N,w))+A;return H.xy*c.xy/c.z+H.zw;}vec2 a4(vec2 a9,vec3 U,vec3 X){vec3 J,M,N,A;vec4 H,O;aO(a3(a9),J,M,N,A,H,O);vec2 d=(aP(J,M,N,A,H,X)-aP(J,M,N,A,H,U))*O.zw;return vec2(-d.x,d.y);}vec3 a2(float E){vec2 a=F(E,0.0);vec2 b=F(E,1.0);vec2 c=F(E,2.0);vec2 d=F(E,3.0);vec2 Z=F(E,4.0);vec2 f=F(E,5.0);vec3 A=vec3(Z.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*A.x+vec3(b.y,c.x,c.y)*A.y+vec3(d.x,d.y,Z.x)*A.z);}float bd(vec3 aU,out float ap){float ax=0.0;ap=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(a2(float(i))-aU);if(d<ap){ap=d;ax=float(i);}}return ax;}vec2 be(float E,vec2 st){vec3 J,M,N,A;vec4 H,O;aO(E,J,M,N,A,H,O);return O.xy+vec2(st.x,1.0-st.y)*O.zw;}
#endif
#endif
void main(){float A=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float an=u_gsplatTexResolution.x;float aV=u_gsplatTexResolution.y;float aF=a_index;float aZ=floor(aF/1024.0);float ah=mod(aF,1024.0)*4.0;float v=(aZ+0.5)/aV;vec4 p1=texture2D(u_gsplatTex,vec2((ah+0.5)/an,v));v_position=vec4(p1.xyz,1.0);vec4 ao=u_viewMatrix*u_modelMatrix*v_position;vec4 G=u_projectionMatrix*ao;float ag=1.5*G.w;if(G.z<-G.w||G.z>G.w||G.x<-ag||G.x>ag||G.y<-ag||G.y>ag){gl_Position=vec4(0.0,0.0,2.0,1.0);return;}vec4 p2=texture2D(u_gsplatTex,vec2((ah+1.5)/an,v));vec4 p3=texture2D(u_gsplatTex,vec2((ah+2.5)/an,v));vec4 p4=texture2D(u_gsplatTex,vec2((ah+3.5)/an,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 at=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 I=aX(p3.zw);vec3 W=normalize(cross((abs(I.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),I));vec3 am=cross(I,W);vec3 aR=at*W;vec3 au=at*am;float af=dot(W,aR),cb=dot(W,au),cd=dot(am,au);float aE=af-cd;float aj=(abs(cb)<1e-9&&abs(aE)<1e-9)?0.0:0.5*atan(2.0*cb,aE);float aA=0.5*(af+cd);float aD=sqrt(max(0.25*(af-cd)*(af-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(aA+aD,0.0));float s2=UV_FILL*sqrt(max(aA-aD,0.0));vec3 av=s1*(cos(aj)*W+sin(aj)*am);vec3 aw=s2*(-sin(aj)*W+cos(aj)*am);vec2 aG=u_focal/u_resolution;vec3 U=p1.xyz;vec3 X=U+a_position.x*av+a_position.y*aw;vec2 a_=aG*vec2(U.x,-U.y)/(-U.z)+0.5;vec2 ba=aG*vec2(X.x,-X.y)/(-X.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=a4(v_uv,U,X);
#else
v_uvStep=ba-a_;
#endif
v_texcoord=a_position;vec2 as=G.xy/G.w;vec4 aB=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+av,1.0);vec4 aC=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+aw,1.0);vec2 ab=aB.xy/aB.w-as;vec2 ar=aC.xy/aC.w-as;float aJ=2.0/max(u_resolution.x,u_resolution.y);float aq=length(ab),l2n=length(ar);if(aq>1e-8)ab*=max(aq,aJ)/aq;if(l2n>1e-8)ar*=max(l2n,aJ)/l2n;v_position=vec4((a_position.x*ab+a_position.y*ar),G.z/G.w,1.0);float al=SPLAT_SCALE;vec4 aI=ak(v_uv);float ai=aI.a>0.5?random(aI.rgb):random(v_uv);vec2 a7=aN(ab,ai,u_time);vec2 a8=aN(ab,ai,u_time-u_delta);v_vel=(a7-a8)*0.5*u_resolution;v_position.xy=as+al*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 ao=u_viewMatrix*u_modelMatrix*a_position;vec4 G=u_projectionMatrix*ao;;float al=6.0;
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);vec3 aT=texture2D(u_alignedTex,v_texcoord).rgb;float ay=luma(aT);
#if !defined(MODEL_PRIMITIVE_POINTS)
float bb=0.002+ay;v_position.xyz+=v_normal*(0.003*bb);
#endif
#endif
v_color=vec4(mix(vec3(0.0),vec3(0.0,0.7,0.9),ay),1.0);
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);v_vel=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=al;if(al>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
