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
vec3 aM(vec2 f){vec3 I=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float o=max(-I.z,0.0);I.x+=I.x>=0.0?-o:o;I.y+=I.y>=0.0?-o:o;return normalize(I);}
#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL
uniform sampler2D u_strokesAtlasCamTex;
#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif
vec2 B(float A,float aU){vec2 st=vec2((aU+0.5)/STROKES_ATLAS_CAM_TEXELS,1.0-(A+0.5)/STROKES_ATLAS_VIEWS);vec4 c=floor(texture2D(u_strokesAtlasCamTex,st)*255.0+0.5);vec2 O=vec2(c.r*256.0+c.g,c.b*256.0+c.a)/65535.0;return(O*2.0-1.0)*STROKES_ATLAS_CAM_RANGE;}void aD(float A,out vec3 J,out vec3 L,out vec3 M,out vec3 o,out vec4 H,out vec4 N){vec2 a=B(A,0.0);vec2 b=B(A,1.0);vec2 c=B(A,2.0);vec2 d=B(A,3.0);vec2 W=B(A,4.0);vec2 f=B(A,5.0);J=vec3(a.x,a.y,b.x);L=vec3(b.y,c.x,c.y);M=vec3(d.x,d.y,W.x);o=vec3(W.y,f.x,f.y);H=vec4(B(A,6.0),B(A,7.0));N=vec4(B(A,8.0),B(A,9.0));}float aS(vec2 E){vec2 as=floor(clamp(E,0.0,0.99999)*vec2(STROKES_ATLAS_COLS,STROKES_ATLAS_ROWS));return as.y*STROKES_ATLAS_COLS+as.x;}vec2 aE(vec3 J,vec3 L,vec3 M,vec3 o,vec4 H,vec3 w){vec3 c=vec3(dot(J,w),dot(L,w),dot(M,w))+o;return H.xy*c.xy/c.z+H.zw;}vec2 aT(vec2 aV,vec3 Q,vec3 U){vec3 J,L,M,o;vec4 H,N;aD(aS(aV),J,L,M,o,H,N);vec2 d=(aE(J,L,M,o,H,U)-aE(J,L,M,o,H,Q))*N.zw;return vec2(-d.x,d.y);}vec3 aR(float A){vec2 a=B(A,0.0);vec2 b=B(A,1.0);vec2 c=B(A,2.0);vec2 d=B(A,3.0);vec2 W=B(A,4.0);vec2 f=B(A,5.0);vec3 o=vec3(W.y,f.x,f.y);return-(vec3(a.x,a.y,b.x)*o.x+vec3(b.y,c.x,c.y)*o.y+vec3(d.x,d.y,W.x)*o.z);}float a2(vec3 aJ,out float ah){float aq=0.0;ah=1e20;for(int i=0;i<STROKES_ATLAS_MAX_VIEWS;i++){if(float(i)>=STROKES_ATLAS_VIEWS)break;float d=length(aR(float(i))-aJ);if(d<ah){ah=d;aq=float(i);}}return aq;}vec2 a3(float A,vec2 st){vec3 J,L,M,o;vec4 H,N;aD(A,J,L,M,o,H,N);return N.xy+vec2(st.x,1.0-st.y)*N.zw;}
#endif
#endif
void main(){float o=u_time*0.25;
#ifdef MODEL_PRIMITIVE_GSPLATS
float ag=u_gsplatTexResolution.x;float aK=u_gsplatTexResolution.y;float ad=a_index;float aO=floor(ad/1024.0);float ac=mod(ad,1024.0)*4.0;float v=(aO+0.5)/aK;vec4 p1=texture2D(u_gsplatTex,vec2((ac+0.5)/ag,v));v_position=vec4(p1.xyz,1.0);vec4 aa=u_viewMatrix*u_modelMatrix*v_position;vec4 G=u_projectionMatrix*aa;float ab=1.5*G.w;if(G.z<-G.w||G.z>G.w||G.x<-ab||G.x>ab||G.y<-ab||G.y>ab){gl_Position=vec4(0.0,0.0,2.0,1.0);return;}vec4 p2=texture2D(u_gsplatTex,vec2((ac+1.5)/ag,v));vec4 p3=texture2D(u_gsplatTex,vec2((ac+2.5)/ag,v));vec4 p4=texture2D(u_gsplatTex,vec2((ac+3.5)/ag,v));float u_hi=floor(p4.r*255.0+0.5);float u_lo=floor(p4.g*255.0+0.5);float v_hi=floor(p4.b*255.0+0.5);float v_lo=floor(p4.a*255.0+0.5);v_uv=vec2(u_hi*256.0+u_lo,v_hi*256.0+v_lo)/65535.0;mat3 am=mat3(p2.x,p2.y,p2.z,p2.y,p2.w,p3.x,p2.z,p3.x,p3.y);vec3 I=aM(p3.zw);vec3 R=normalize(cross((abs(I.x)<0.9?vec3(1.0,0.0,0.0):vec3(0.0,1.0,0.0)),I));vec3 af=cross(I,R);vec3 aH=am*R;vec3 an=am*af;float Z=dot(R,aH),cb=dot(R,an),cd=dot(af,an);float ax=Z-cd;float ae=(abs(cb)<1e-9&&abs(ax)<1e-9)?0.0:0.5*atan(2.0*cb,ax);float at=0.5*(Z+cd);float aw=sqrt(max(0.25*(Z-cd)*(Z-cd)+cb*cb,0.0));float s1=UV_FILL*sqrt(max(at+aw,0.0));float s2=UV_FILL*sqrt(max(at-aw,0.0));vec3 ao=s1*(cos(ae)*R+sin(ae)*af);vec3 ap=s2*(-sin(ae)*R+cos(ae)*af);vec2 ay=u_focal/u_resolution;vec3 Q=p1.xyz;vec3 U=Q+a_position.x*ao+a_position.y*ap;vec2 aW=ay*vec2(Q.x,-Q.y)/(-Q.z)+0.5;vec2 aX=ay*vec2(U.x,-U.y)/(-U.z)+0.5;
#ifdef STROKES_ATLAS
v_uvStep=aT(v_uv,Q,U);
#else
v_uvStep=aX-aW;
#endif
v_texcoord=a_position;vec2 al=G.xy/G.w;vec4 au=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ao,1.0);vec4 av=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(p1.xyz+ap,1.0);vec2 aj=au.xy/au.w-al;vec2 ak=av.xy/av.w-al;float az=2.0/max(u_resolution.x,u_resolution.y);float ai=length(aj),l2n=length(ak);if(ai>1e-8)aj*=max(ai,az)/ai;if(l2n>1e-8)ak*=max(l2n,az)/l2n;v_position=vec4((a_position.x*aj+a_position.y*ak),G.z/G.w,1.0);v_position.y+=fract(u_time*0.05+fract(ad*0.1)*3.1415)*step(0.9,sin(u_time*0.1+ad*0.1));float Y=SPLAT_SCALE;v_position.xy=al+Y*v_position.xy;gl_Position=v_position;
#else
v_position=u_modelMatrix*a_position;v_texcoord=a_position.xy*0.5+0.5;vec4 aa=u_viewMatrix*u_modelMatrix*a_position;vec4 G=u_projectionMatrix*aa;;float Y=6.0;Y*=smoothstep(0.45,0.5,1.0-fract(length(aa.z)-o));
#ifdef MODEL_VERTEX_TEXCOORD
v_texcoord=a_texcoord;
#endif
#ifdef MODEL_VERTEX_NORMAL
v_normal=normalize(u_normalMatrix*a_normal);vec3 aI=texture2D(u_alignedTex,v_texcoord).rgb;float ar=luma(aI);
#if !defined(MODEL_PRIMITIVE_POINTS)
float aY=0.002+ar;v_position.xyz+=v_normal*(0.003*aY);
#endif
#endif
v_color=vec4(mix(vec3(0.0),vec3(0.0,0.7,0.9),ar),1.0);
#ifdef MODEL_VERTEX_COLOR
v_color=a_color;
#endif
v_uv=v_texcoord;v_uvStep=vec2(0.0);
#if defined(MODEL_PRIMITIVE_POINTS)
gl_PointSize=Y;if(Y>0.0){gl_Position=u_projectionMatrix*u_viewMatrix*v_position;}else{gl_Position=vec4(0.0);}
#else
gl_Position=u_projectionMatrix*u_viewMatrix*v_position;
#endif
#endif
}
