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
vec2 ae(vec2 o){
#if MAP_FLIP_Y
o.y=1.0-o.y;
#endif
#if MAP_WRAP
o=fract(o);
#endif
return o;}vec4 aQ(sampler2D tex,vec2 o){return texture2D(tex,ae(o));}vec4 al(vec2 o){vec2 g=ae(o);if(MAP_INDEX_RESOLUTION.x>0.5)g=(floor(g*MAP_INDEX_RESOLUTION)+0.5)/MAP_INDEX_RESOLUTION;return texture2D(MAP_INDEX_TEX,g);}bool aP(vec4 a,vec4 b){if(a.a<0.5||b.a<0.5)return false;vec3 d=abs(a.rgb-b.rgb);return max(d.r,max(d.g,d.b))<=MAP_SAMEMARK_EPSILON;}
#endif
vec2 aS(vec2 aX,float aj,float bb){return aX*STROKE_TRAVEL*sin(TAU*(bb*STROKE_SPEED+aj));}vec3 a5(vec2 f){vec3 J=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float A=max(-J.z,0.0);J.x+=J.x>=0.0?-A:A;J.y+=J.y>=0.0?-A:A;return normalize(J);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 G(float F,float ba){vec2 st=vec2((ba+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(F+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 U=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(U*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aT(float F,out vec3 M,out vec3 N,out vec3 O,out vec3 A,out vec4 I,out vec4 Q){vec2 a=G(F,0.0);vec2 b=G(F,1.0);vec2 c=G(F,2.0);vec2 d=G(F,3.0);vec2 aa=G(F,4.0);vec2 f=G(F,5.0);M=vec3(a.x,a.y,b.x);N=vec3(b.y,c.x,c.y);O=vec3(d.x,d.y,aa.x);A=vec3(aa.y,f.x,f.y);I=vec4(G(F,6.0),G(F,7.0));Q=vec4(G(F,8.0),G(F,9.0));}float a9(vec2 o){vec2 aB=floor(clamp(o,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return aB.y*STROKES_ATLAS_COLS+aB.x;}vec2 aU(vec3 M,vec3 N,vec3 O,vec3 A,vec4 I,vec3 w){vec3 c=vec3(dot(M,w),dot(N,w),dot(O,w))+A;return I.xy*c.xy/c.z+I.zw;}vec2 a_(vec2 be,vec3 W,vec3 Y){vec3 M,N,O,A;vec4 I,Q;aT(a9(be),M,N,O,A,I,Q);vec2 d=(aU(M,N,O,A,I,Y)-aU(M,N,O,A,I,W))*Q.zw;return vec2(-d.x,d.y);}vec3 a8(float F){vec2 a=G(F,0.0);vec2 b=G(F,1.0);vec2 c=G(F,2.0);vec2 d=G(F,3.0);vec2 aa=G(F,4.0);vec2 f=G(F,5.0);vec3 A=vec3(aa.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*A.x+vec3(b.y,c.x,c.y)*A.y+vec3(d.x,d.y,aa.x)*A.z);}float bj(vec3 aZ,out float aq){float az=0.0;aq=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(a8(float(i))-aZ);if(d<aq){aq=d;az=float(i);}}return az;}vec2 bk(float F,vec2 st){vec3 M,N,O,A;vec4 I,Q;aT(F,M,N,O,A,I,Q);return Q.xy+vec2(st.x,1.0-st.y)*Q.zw;}
#endif
#endif
void main(){float A=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float ao=u_gsplatTexResolution.x;float a2=u_gsplatTexResolution.y;float aH=a_index;float a7=floor(aH/1024.0);float ah=mod(aH,1024.0)*4.0;float v=(a7+0.5)/a2;vec4 p1=texture2D(u_gsplatTex,vec2((ah+0.5)/ao,v));v_position=vec4(p1.xyz,1.0);vec4 ap=u_viewMatrix*u_modelMatrix*v_position;vec4 H=u_projectionMatrix*ap;float ag=1.5*H.w;if(H.z<-H.w||H.z>H.w||H.x<-ag||H.x>ag||H.y<-ag||H.y>ag){gl_Position=vec4(0.0,0.0,2.0,1.0);return;}vec4 p2=texture2D(u_gsplatTex,vec2((ah+1.5)/ao,v));vec4 p3=texture2D(u_gsplatTex,vec2((ah+2.5)/ao,v));vec4 p4=texture2D(u_gsplatTex,vec2((ah+3.5)/ao,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 av=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 J=a5(p3.zw);vec3 X=normalize(cross((abs(J.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),J));vec3 an=cross(J,X);vec3 aW=av*X;vec3 aw=av*an;float af=dot(X,aW),cb=dot(X,aw),cd=dot(an,aw);float aG=af-cd;float ak=(abs(cb)<1e-9&&abs(aG)<1e-9)?0.0:0.5*atan(2.0*cb,aG);float aC=0.5*(af+cd);float aF=sqrt(max(0.25*(af-cd)*(af-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(aC+aF,0.0));float s2=UV_FILL*sqrt(max(aC-aF,0.0));vec3 ax=s1*(cos(ak)*X+sin(ak)*an);vec3 ay=s2*(-sin(ak)*X+cos(ak)*an);vec2 aI=u_focal/u_resolution;vec3 W=p1.xyz;vec3 Y=W+a_position.x*ax+a_position.y*ay;vec2 bf=aI*vec2(W.x,-W.y)/(-W.z)+0.5;vec2 bg=aI*vec2(Y.x,-Y.y)/(-Y.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=a_(v_uv,W,Y);
#else
v_uvStep=bg-bf;
#endif
v_texcoord=a_position;vec2 au=H.xy/H.w;vec4 aD=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ax,1.0);vec4 aE=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ay,1.0);vec2 ac=aD.xy/aD.w-au;vec2 at=aE.xy/aE.w-au;float aN=2.0/max(u_resolution.x,u_resolution.y);float ar=length(ac),l2n=length(at);if(ar>1e-8)ac*=max(ar,aN)/ar;if(l2n>1e-8)at*=max(l2n,aN)/l2n;v_position=vec4((a_position.x*ac+a_position.y*at),H.z/H.w,1.0);float am=SPLAT_SCALE;vec4 aM=al(v_uv);float aj=aM.a>0.5?random(aM.rgb):random(v_uv);vec2 bc=aS(ac,aj,u_time);vec2 bd=aS(ac,aj,u_time-u_delta);v_vel=(bc-bd)*0.5*u_resolution;v_position.xy=au+am*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 ap=u_viewMatrix*u_modelMatrix*a_position;vec4 H=u_projectionMatrix*ap;;float am=6.0;
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);vec3 aY=texture2D(u_alignedTex,v_texcoord).rgb;float aA=luma(aY);
#if !defined(MODEL_PRIMITIVE_POINTS)
float bh=0.002+aA;v_position.xyz+=v_normal*(0.003*bh);
#endif
#endif
v_color=vec4(mix(vec3(0.0),vec3(0.0,0.7,0.9),aA),1.0);
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);v_vel=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=am;if(am>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
