/** One composited image layer keeps auth motion smooth across login and register. */
export function AuthMotionBackground() {
  return <div className="login-motion-wall" aria-hidden="true"><div className="auth-motion-image" /></div>;
}
