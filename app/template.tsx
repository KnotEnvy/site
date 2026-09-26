/**
 * Re-mounts on every navigation, so each page arrives with a short fade-rise
 * while the WebGL sky behind it eases into the new page's journey.
 *
 * Deliberately a CSS animation, not a Motion `initial` state: a keyframe
 * animation runs whether or not JS ever hydrates, so this can never become the
 * SSR opacity:0 trap (handoff.json criticalLessons #6). Only opacity and a
 * small translate are animated - never blur, which on a 10,000px-tall page is
 * a full-document repaint every frame. The global reduced-motion rule
 * collapses the duration to nothing.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
