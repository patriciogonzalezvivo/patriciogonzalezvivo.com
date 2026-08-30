#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_gsplatTex;
uniform vec2        u_gsplatTexResolution;

uniform mat4        u_projectionMatrix;
uniform mat4        u_viewMatrix;
uniform mat4        u_modelMatrix;

uniform vec2        u_resolution;
uniform vec2        u_focal;
uniform float       u_time;

#ifdef MODEL_PRIMITIVE_GSPLATS
attribute vec2      a_position;
attribute float     a_index;
#else
attribute vec4      a_position;
#ifdef MODEL_VERTEX_NORMAL
attribute vec3      a_normal;
#endif
#ifdef MODEL_VERTEX_TEXCOORD
attribute vec2      a_texcoord;
#endif
#endif

varying vec4        v_position;
varying vec4        v_color;
varying vec3        v_normal;
varying vec2        v_texcoord;
varying vec2        v_uv;
varying vec2        v_uvStep;

#define SPLAT_SCALE 1.
#define UV_FILL 0.5

#include "lygia/generative/random.glsl"

vec3 octDecode(vec2 f) {
    vec3 n = vec3(f.x, f.y, 1.0 - abs(f.x) - abs(f.y));
    float t = max(-n.z, 0.0);
    n.x += n.x >= 0.0 ? -t : t;
    n.y += n.y >= 0.0 ? -t : t;
    return normalize(n);
}

void main() {
#ifdef MODEL_PRIMITIVE_GSPLATS
    float width  = u_gsplatTexResolution.x;
    float height = u_gsplatTexResolution.y;

    float fIndex = a_index;
    float row = floor(fIndex / 1024.0);
    float colStart = mod(fIndex, 1024.0) * 4.0;
    float v = (row + 0.5) / height;

    vec4 p1 = texture2D(u_gsplatTex, vec2((colStart + 0.5) / width, v));

    v_position = vec4(p1.xyz, 1.0);
    vec4 cam = u_viewMatrix * u_modelMatrix * v_position;
    vec4 pos2d = u_projectionMatrix * cam;

    // Frustum culling
    float clip = 1.5 * pos2d.w;
    if (pos2d.z < -pos2d.w || pos2d.z > pos2d.w ||
        pos2d.x < -clip || pos2d.x > clip ||
        pos2d.y < -clip || pos2d.y > clip) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
    }

    vec4 p2 = texture2D(u_gsplatTex, vec2((colStart + 1.5) / width, v));
    vec4 p3 = texture2D(u_gsplatTex, vec2((colStart + 2.5) / width, v));
    vec4 p4 = texture2D(u_gsplatTex, vec2((colStart + 3.5) / width, v));

    float u_hi = floor(p4.r * 255.0 + 0.5);
    float u_lo = floor(p4.g * 255.0 + 0.5);
    float v_hi = floor(p4.b * 255.0 + 0.5);
    float v_lo = floor(p4.a * 255.0 + 0.5);
    v_uv = vec2(u_hi * 256.0 + u_lo, v_hi * 256.0 + v_lo) / 65535.0;

    mat3 Vrk = mat3(
        p2.x, p2.y, p2.z,
        p2.y, p2.w, p3.x,
        p2.z, p3.x, p3.y
    );

    vec3 n = octDecode(p3.zw);                       // world thin axis (normal)
    vec3 t1 = normalize(cross((abs(n.x) < 0.9 ? vec3(1.0, 0.0, 0.0)
                                              : vec3(0.0, 1.0, 0.0)), n));
    vec3 t2 = cross(n, t1);
    vec3 Vt1 = Vrk * t1;
    vec3 Vt2 = Vrk * t2;
    float ca = dot(t1, Vt1), cb = dot(t1, Vt2), cd = dot(t2, Vt2);
    float da = ca - cd;
    float phi = (abs(cb) < 1e-9 && abs(da) < 1e-9) ? 0.0 : 0.5 * atan(2.0 * cb, da);
    phi += u_time * (0.25 + fract(fIndex * 0.5) * 2.0);

    float cl = 0.5 * (ca + cd);
    float cr = sqrt(max(0.25 * (ca - cd) * (ca - cd) + cb * cb, 0.0));
    float s1 = UV_FILL * sqrt(max(cl + cr, 0.0));
    float s2 = UV_FILL * sqrt(max(cl - cr, 0.0));
    vec3 axis1 = s1 * (cos(phi) * t1 + sin(phi) * t2);
    vec3 axis2 = s2 * (-sin(phi) * t1 + cos(phi) * t2);
    vec2 focalN = u_focal / u_resolution;
    vec3 wCenter = p1.xyz;
    vec3 wCorner = wCenter + a_position.x * axis1 + a_position.y * axis2;
    vec2 uvCenter = focalN * vec2(wCenter.x, -wCenter.y) / (-wCenter.z) + 0.5;
    vec2 uvCorner = focalN * vec2(wCorner.x, -wCorner.y) / (-wCorner.z) + 0.5;

    v_uvStep = uvCorner - uvCenter;
    v_texcoord = a_position;

    vec2 vCenter = pos2d.xy / pos2d.w;
    vec4 clipA = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(p1.xyz + axis1, 1.0);
    vec4 clipB = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(p1.xyz + axis2, 1.0);
    vec2 ndcAxis1 = clipA.xy / clipA.w - vCenter;
    vec2 ndcAxis2 = clipB.xy / clipB.w - vCenter;

    float minLen = 2.0 / max(u_resolution.x, u_resolution.y);
    float l1n = length(ndcAxis1), l2n = length(ndcAxis2);
    if (l1n > 1e-8) ndcAxis1 *= max(l1n, minLen) / l1n;
    if (l2n > 1e-8) ndcAxis2 *= max(l2n, minLen) / l2n;


    v_position = vec4(
        (a_position.x * ndcAxis1 + a_position.y * ndcAxis2),
        pos2d.z / pos2d.w, 1.0
    );

    v_position.y += fract(u_time * 0.05 + fract(fIndex * 0.1) * 3.1415 ) * step(0.9, sin(u_time * 0.1 + fIndex * 0.1));

    float scale = SPLAT_SCALE;
    float t = u_time * 0.25;
    // scale *= smoothstep(0.45, 0.5, fract(length(cam.xy)*1. - t));
    // scale *= smoothstep(1.0, 0.0, fract(pos2d.z * 0.1 - t));
    v_position.xy = vCenter + scale * v_position.xy;

    gl_Position = v_position;

#else

    v_position = u_modelMatrix * a_position;
    v_texcoord = a_position.xy * 0.5 + 0.5;
    #ifdef MODEL_VERTEX_TEXCOORD
    v_texcoord = a_texcoord;
    #endif
    #ifdef MODEL_VERTEX_NORMAL
    v_normal = vec4(u_modelMatrix * vec4(a_normal, 0.0)).xyz;
    #endif
    v_color = vec4(0.8, 0.8, 0.8, 1.0);
    v_uv = v_texcoord;
    v_uvStep = vec2(0.0);
    gl_Position = u_projectionMatrix * u_viewMatrix * v_position;

#endif
}
