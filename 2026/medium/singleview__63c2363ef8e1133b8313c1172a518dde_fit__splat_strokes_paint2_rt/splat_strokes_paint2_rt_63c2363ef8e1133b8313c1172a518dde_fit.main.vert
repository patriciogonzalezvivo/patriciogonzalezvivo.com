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
#define SPLAT_SCALE 1.25
#define UV_FILL 0.5
#include "lygia/generative/random.glsl"
#include "lygia/color/luma.glsl"
vec3 aP(vec2 f){vec3 M=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float o=max(-M.z,0.0);M.x+=M.x>=0.0?-o:o;M.y+=M.y>=0.0?-o:o;return normalize(M);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 G(float E,float aY){vec2 st=vec2((aY+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(E+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 X=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(X*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aG(float E,out vec3 N,out vec3 O,out vec3 Q,out vec3 o,out vec4 J,out vec4 U){vec2 a=G(E,0.0);vec2 b=G(E,1.0);vec2 c=G(E,2.0);vec2 d=G(E,3.0);vec2 aa=G(E,4.0);vec2 f=G(E,5.0);N=vec3(a.x,a.y,b.x);O=vec3(b.y,c.x,c.y);Q=vec3(d.x,d.y,aa.x);o=vec3(aa.y,f.x,f.y);J=vec4(G(E,6.0),G(E,7.0));U=vec4(G(E,8.0),G(E,9.0));}float aW(vec2 H){vec2 aw=floor(clamp(H,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return aw.y*STROKES_ATLAS_COLS+aw.x;}vec2 aH(vec3 N,vec3 O,vec3 Q,vec3 o,vec4 J,vec3 w){vec3 c=vec3(dot(N,w),dot(O,w),dot(Q,w))+o;return J.xy*c.xy/c.z+J.zw;}vec2 aX(vec2 aZ,vec3 W,vec3 Z){vec3 N,O,Q,o;vec4 J,U;aG(aW(aZ),N,O,Q,o,J,U);vec2 d=(aH(N,O,Q,o,J,Z)-aH(N,O,Q,o,J,W))*U.zw;return vec2(-d.x,d.y);}vec3 aV(float E){vec2 a=G(E,0.0);vec2 b=G(E,1.0);vec2 c=G(E,2.0);vec2 d=G(E,3.0);vec2 aa=G(E,4.0);vec2 f=G(E,5.0);vec3 o=vec3(aa.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*o.x+vec3(b.y,c.x,c.y)*o.y+vec3(d.x,d.y,aa.x)*o.z);}float a6(vec3 aM,out float al){float au=0.0;al=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aV(float(i))-aM);if(d<al){al=d;au=float(i);}}return au;}vec2 a7(float E,vec2 st){vec3 N,O,Q,o;vec4 J,U;aG(E,N,O,Q,o,J,U);return U.xy+vec2(st.x,1.0-st.y)*U.zw;}
#endif
#endif
void main(){float o=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float ak=u_gsplatTexResolution.x;float aN=u_gsplatTexResolution.y;float ah=a_index;float aS=floor(ah/1024.0);float ag=mod(ah,1024.0)*4.0;float v=(aS+0.5)/aN;vec4 p1=texture2D(u_gsplatTex,vec2((ag+0.5)/ak,v));v_position=vec4(p1.xyz,1.0);vec4 ae=u_viewMatrix*u_modelMatrix*v_position;vec4 I=u_projectionMatrix*ae;float af=1.5*I.w;if(I.z<-I.w||I.z>I.w||I.x<-af||I.x>af||I.y<-af||I.y>af){gl_Position=vec4(0.0,0.0,2.0,1.0);return;}vec4 p2=texture2D(u_gsplatTex,vec2((ag+1.5)/ak,v));vec4 p3=texture2D(u_gsplatTex,vec2((ag+2.5)/ak,v));vec4 p4=texture2D(u_gsplatTex,vec2((ag+3.5)/ak,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 aq=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 M=aP(p3.zw);vec3 Y=normalize(cross((abs(M.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),M));vec3 aj=cross(M,Y);vec3 aK=aq*Y;vec3 ar=aq*aj;float ad=dot(Y,aK),cb=dot(Y,ar),cd=dot(aj,ar);float aB=ad-cd;float ai=(abs(cb)<1e-9&&abs(aB)<1e-9)?0.0:0.5*atan(2.0*cb,aB);float ax=0.5*(ad+cd);float aA=sqrt(max(0.25*(ad-cd)*(ad-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(ax+aA,0.0));float s2=UV_FILL*sqrt(max(ax-aA,0.0));vec3 as=s1*(cos(ai)*Y+sin(ai)*aj);vec3 at=s2*(-sin(ai)*Y+cos(ai)*aj);vec2 aC=u_focal/u_resolution;vec3 W=p1.xyz;vec3 Z=W+a_position.x*as+a_position.y*at;vec2 a2=aC*vec2(W.x,-W.y)/(-W.z)+0.5;vec2 a3=aC*vec2(Z.x,-Z.y)/(-Z.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aX(v_uv,W,Z);
#else
v_uvStep=a3-a2;
#endif
v_texcoord=a_position;vec2 ap=I.xy/I.w;vec4 ay=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+as,1.0);vec4 az=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+at,1.0);vec2 an=ay.xy/ay.w-ap;vec2 ao=az.xy/az.w-ap;float aD=2.0/max(u_resolution.x,u_resolution.y);float am=length(an),l2n=length(ao);if(am>1e-8)an*=max(am,aD)/am;if(l2n>1e-8)ao*=max(l2n,aD)/l2n;v_position=vec4((a_position.x*an+a_position.y*ao),I.z/I.w,1.0);v_position.y+=fract(u_time*0.05+fract(ah*0.1)*3.1415)*step(0.9,sin(u_time*0.1+ah*0.1));float ac=SPLAT_SCALE;v_position.xy=ap+ac*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 ae=u_viewMatrix*u_modelMatrix*a_position;vec4 I=u_projectionMatrix*ae;;float ac=6.0;ac*=smoothstep(0.45,0.5,1.0-fract(length(ae.z)-o));
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);vec3 aL=texture2D(u_alignedTex,v_texcoord).rgb;float av=luma(aL);
#if !defined(MODEL_PRIMITIVE_POINTS)
float a4=0.002+av;v_position.xyz+=v_normal*(0.003*a4);
#endif
#endif
v_color=vec4(mix(vec3(0.0),vec3(0.0,0.7,0.9),av),1.0);
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=ac;if(ac>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
