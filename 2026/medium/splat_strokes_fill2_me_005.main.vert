#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D   u_alignedTex;
uniform sampler2D   u_gsplatTex;
uniform vec2        u_gsplatTexResolution;

uniform mat4        u_projectionMatrix;
uniform mat4        u_viewMatrix;
uniform mat4        u_modelMatrix;
uniform mat3        u_normalMatrix;

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
#ifdef MODEL_VERTEX_COLOR
attribute vec4      a_color;
#endif
#endif

varying vec4        v_position;
varying vec4        v_color;
varying vec3        v_normal;
varying vec2        v_texcoord;
varying vec2        v_uv;
varying vec2        v_uvStep;

#define SPLAT_SCALE 1.25
#define UV_FILL 0.55
vec3 octDecode(vec2 f) {
    vec3 n = vec3(f.x, f.y, 1.0 - abs(f.x) - abs(f.y));
    float t = max(-n.z, 0.0);
    n.x += n.x >= 0.0 ? -t : t;
    n.y += n.y >= 0.0 ? -t : t;
    return normalize(n);
}

#include "lygia/color/luma.glsl"
#include "lygia/generative/snoise.glsl"
// Multiview strokes atlas -- shared by every shaders/splat_strokes*/main.vert
// (included as "../splat_strokes/atlas.glsl"; see CLAUDE.md §6/§11).
//
// Singleview (no STROKES_ATLAS): this file is empty and the shaders keep their
// original "frontal" reprojection through the one source camera at the origin.
//
// Multiview (strokes.py --splat on a COLMAP scene, which writes
// strokes/atlas.json; apply.py passes its -D defines + textures for a scene):
// the splat lives in the raw COLMAP world frame, and each splat's v_uv (its
// colour bytes) is an ATLAS uv -- u_alignedTex / u_strokeIndicesTex /
// u_imageTex are grids of per-view tiles. The splat's tile tells which camera
// it was traced from; that camera's pose/intrinsics/tile rect come from
// u_strokesAtlasCamTex (utils/strokes_atlas.py encode_camera_texture), so the
// fragment's uv offset can be computed through the *right* camera instead of
// the frontal one.
//
// Defines (all floats, from atlas.json): STROKES_ATLAS, STROKES_ATLAS_COLS,
// STROKES_ATLAS_ROWS, STROKES_ATLAS_VIEWS, STROKES_ATLAS_CAM_TEXELS,
// STROKES_ATLAS_CAM_RANGE, STROKES_ATLAS_BASELINE.

#ifdef STROKES_ATLAS
#ifndef STROKES_ATLAS_GLSL
#define STROKES_ATLAS_GLSL

uniform sampler2D   u_strokesAtlasCamTex;   // strokes/atlas_cameras.png

#ifndef STROKES_ATLAS_MAX_VIEWS
#define STROKES_ATLAS_MAX_VIEWS 64
#endif

// Two values from texel `texel` of view `view`'s row: each is 16-bit fixed
// point across two bytes, (r,g) and (b,a), mapped from [-RANGE, RANGE].
// Texel centres make the LINEAR-filtered fetch exact. Rows are flipped like
// every other texture here (glslViewer's default vFlip: image row 0 -> v=1).
vec2 strokesAtlasFetch(float view, float texel) {
    vec2 st = vec2((texel + 0.5) / STROKES_ATLAS_CAM_TEXELS,
                   1.0 - (view + 0.5) / STROKES_ATLAS_VIEWS);
    vec4 c = floor(texture2D(u_strokesAtlasCamTex, st) * 255.0 + 0.5);
    vec2 q = vec2(c.r * 256.0 + c.g, c.b * 256.0 + c.a) / 65535.0;
    return (q * 2.0 - 1.0) * STROKES_ATLAS_CAM_RANGE;
}

// View `view`'s world->camera rows r0..r2 and t (COLMAP), normalized
// intrinsics K = (fx, fy, cx, cy) and its tile rect (u0, v0, su, sv) in atlas
// uv (y down).
void strokesAtlasCamera(float view, out vec3 r0, out vec3 r1, out vec3 r2,
                        out vec3 t, out vec4 K, out vec4 rect) {
    vec2 a = strokesAtlasFetch(view, 0.0);
    vec2 b = strokesAtlasFetch(view, 1.0);
    vec2 c = strokesAtlasFetch(view, 2.0);
    vec2 d = strokesAtlasFetch(view, 3.0);
    vec2 e = strokesAtlasFetch(view, 4.0);
    vec2 f = strokesAtlasFetch(view, 5.0);
    r0 = vec3(a.x, a.y, b.x);
    r1 = vec3(b.y, c.x, c.y);
    r2 = vec3(d.x, d.y, e.x);
    t  = vec3(e.y, f.x, f.y);
    K  = vec4(strokesAtlasFetch(view, 6.0), strokesAtlasFetch(view, 7.0));
    rect = vec4(strokesAtlasFetch(view, 8.0), strokesAtlasFetch(view, 9.0));
}

// Which view (tile) an atlas uv (y down) belongs to.
float strokesAtlasTile(vec2 uv) {
    vec2 cell = floor(clamp(uv, 0.0, 0.99999) * vec2(STROKES_ATLAS_COLS, STROKES_ATLAS_ROWS));
    return cell.y * STROKES_ATLAS_COLS + cell.x;
}

// World point -> that view's own image uv (y down), COLMAP pinhole.
vec2 strokesAtlasProject(vec3 r0, vec3 r1, vec3 r2, vec3 t, vec4 K, vec3 w) {
    vec3 c = vec3(dot(r0, w), dot(r1, w), dot(r2, w)) + t;
    return K.xy * c.xy / c.z + K.zw;
}

// Drop-in for the singleview `v_uvStep = uvCorner - uvCenter;`: the atlas-uv
// offset of this quad corner from the splat centre, projected through the
// splat's own source camera and scaled into its tile. Returned in the same
// convention the fragment shaders already undo (they add vec2(-x, y)).
vec2 strokesAtlasUvStep(vec2 uvAtlas, vec3 wCenter, vec3 wCorner) {
    vec3 r0, r1, r2, t; vec4 K, rect;
    strokesAtlasCamera(strokesAtlasTile(uvAtlas), r0, r1, r2, t, K, rect);
    vec2 d = (strokesAtlasProject(r0, r1, r2, t, K, wCorner) -
              strokesAtlasProject(r0, r1, r2, t, K, wCenter)) * rect.zw;
    return vec2(-d.x, d.y);
}

// Camera centre of a view in world space (-R^T t) -- only R and t (texels
// 0-5) are fetched, since this runs per background pixel for every view.
vec3 strokesAtlasCameraCenter(float view) {
    vec2 a = strokesAtlasFetch(view, 0.0);
    vec2 b = strokesAtlasFetch(view, 1.0);
    vec2 c = strokesAtlasFetch(view, 2.0);
    vec2 d = strokesAtlasFetch(view, 3.0);
    vec2 e = strokesAtlasFetch(view, 4.0);
    vec2 f = strokesAtlasFetch(view, 5.0);
    vec3 t = vec3(e.y, f.x, f.y);
    return -(vec3(a.x, a.y, b.x) * t.x + vec3(b.y, c.x, c.y) * t.y + vec3(d.x, d.y, e.x) * t.z);
}

// The painted view whose camera is closest to `eye` (e.g. u_camera); its
// distance in `dist`.
float strokesAtlasNearestView(vec3 eye, out float dist) {
    float best = 0.0;
    dist = 1e20;
    for (int i = 0; i < STROKES_ATLAS_MAX_VIEWS; i++) {
        if (float(i) >= STROKES_ATLAS_VIEWS) break;
        float d = length(strokesAtlasCameraCenter(float(i)) - eye);
        if (d < dist) { dist = d; best = float(i); }
    }
    return best;
}

// Atlas uv (y down) of screen position `st` (GL, y up) inside view `view`'s tile.
vec2 strokesAtlasTileUV(float view, vec2 st) {
    vec3 r0, r1, r2, t; vec4 K, rect;
    strokesAtlasCamera(view, r0, r1, r2, t, K, rect);
    return rect.xy + vec2(st.x, 1.0 - st.y) * rect.zw;
}

#endif
#endif


void main() {
    float t = u_time * 0.25;

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

    vec3 n = octDecode(p3.zw);
    vec3 t1 = normalize(cross((abs(n.x) < 0.9 ? vec3(1.0, 0.0, 0.0)
                                              : vec3(0.0, 1.0, 0.0)), n));
    vec3 t2 = cross(n, t1);

    vec3 Vt1 = Vrk * t1;
    vec3 Vt2 = Vrk * t2;
    float ca = dot(t1, Vt1), cb = dot(t1, Vt2), cd = dot(t2, Vt2);
    
    float da = ca - cd;
    float phi = (abs(cb) < 1e-9 && abs(da) < 1e-9) ? 0.0 : 0.5 * atan(2.0 * cb, da);
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
#ifdef STROKES_ATLAS
    // Multiview scene: project through this splat's own source camera
    // (its atlas tile), not the frontal one -- see ../splat_strokes/atlas.glsl.
    v_uvStep = strokesAtlasUvStep(v_uv, wCenter, wCorner);
#else
    v_uvStep = uvCorner - uvCenter;
#endif

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

    // Reduce scale for finer splat coverage
    v_position = vec4(
        (a_position.x * ndcAxis1 + a_position.y * ndcAxis2),
        pos2d.z / pos2d.w, 1.0
    );

    float scale = SPLAT_SCALE;
    
    // scale *= smoothstep(0.45, 0.5, fract(length(cam.z) - t));
    scale *= smoothstep(0.5, 0.6, 0.5 + snoise(vec3(cam.x * 2.0, cam.y * 3.0, u_time * 0.125)) * 0.5);
    v_position.xy = vCenter + scale * v_position.xy;

    gl_Position = v_position;

#else

    v_position = u_modelMatrix * a_position;
    v_texcoord = a_position.xy * 0.5 + 0.5;
    vec4 cam = u_viewMatrix * u_modelMatrix * a_position;
    vec4 pos2d = u_projectionMatrix * cam;;
    float scale = 6.0;

    scale *= smoothstep(0.45, 0.5, 1.0-fract(length(cam.z) - t));

    #ifdef MODEL_VERTEX_TEXCOORD
    v_texcoord = a_texcoord;
    #endif
    #ifdef MODEL_VERTEX_NORMAL
    v_normal = normalize(u_normalMatrix * a_normal);

    #if !defined(MODEL_PRIMITIVE_POINTS)
    float bright = luma(texture2D(u_alignedTex, v_texcoord).rgb);
    float widthT = bright;
    v_position.xyz += v_normal * (0.001 * widthT);
    #endif

    #endif

    v_color = vec4(0.0, 0.4, 0.6, .9);
    #ifdef MODEL_VERTEX_COLOR
    v_color = a_color;
    #endif
    v_uv = v_texcoord;
    v_uvStep = vec2(0.0);

    #if defined(MODEL_PRIMITIVE_POINTS)
    gl_PointSize = scale;
    if (scale > 0.0) {
        gl_Position = u_projectionMatrix * u_viewMatrix * v_position;
    }
    else {
        gl_Position = vec4(0.0);
    }
    #else

    gl_Position = u_projectionMatrix * u_viewMatrix * v_position;
    #endif

#endif
}
